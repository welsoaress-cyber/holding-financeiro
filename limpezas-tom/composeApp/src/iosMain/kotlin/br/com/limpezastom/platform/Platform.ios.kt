package br.com.limpezastom.platform

import br.com.limpezastom.model.FileKind
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.RawScan
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine
import okio.Buffer
import okio.FileSystem
import okio.Path.Companion.toPath
import okio.Source
import platform.AVFoundation.AVURLAsset
import platform.Foundation.NSCachesDirectory
import platform.Foundation.NSData
import platform.Foundation.NSNumber
import platform.Foundation.NSSearchPathForDirectoriesInDomains
import platform.Foundation.NSTemporaryDirectory
import platform.Foundation.NSUserDomainMask
import platform.Photos.PHAsset
import platform.Photos.PHAssetMediaTypeImage
import platform.Photos.PHAssetMediaTypeVideo
import platform.Photos.PHAssetResource
import platform.Photos.PHAuthorizationStatusAuthorized
import platform.Photos.PHAuthorizationStatusLimited
import platform.Photos.PHAuthorizationStatusNotDetermined
import platform.Photos.PHImageManager
import platform.Photos.PHImageRequestOptions
import platform.Photos.PHPhotoLibrary
import platform.Photos.PHVideoRequestOptions
import platform.darwin.DISPATCH_TIME_FOREVER
import platform.darwin.dispatch_semaphore_create
import platform.darwin.dispatch_semaphore_signal
import platform.darwin.dispatch_semaphore_wait
import platform.posix.memcpy

/** iOS não precisa de contexto — classe vazia só para satisfazer o contrato. */
actual open class PlatformContext

actual fun nowMs(): Long = (platform.Foundation.NSDate().timeIntervalSince1970 * 1000).toLong()

actual fun formatMonthYear(ms: Long): String {
    val date = platform.Foundation.NSDate.dateWithTimeIntervalSince1970(ms / 1000.0)
    val fmt = platform.Foundation.NSDateFormatter()
    fmt.dateFormat = "MMMM 'de' yyyy"
    fmt.locale = platform.Foundation.NSLocale.localeWithLocaleIdentifier("pt_BR")
    return fmt.stringFromDate(date).replaceFirstChar { it.uppercaseChar() }
}

private const val ASSET_PREFIX = "phasset:"

/**
 * Varredura iOS: PhotoKit para fotos/vídeos; sandbox do app para
 * documentos e caches. (No iOS não existe acesso ao sistema de arquivos
 * de outros apps — a "limpeza profunda" não se aplica.)
 */
actual class DeviceScanner actual constructor(private val context: PlatformContext) {

    actual suspend fun scanRaw(): RawScan {
        if (!ensurePhotoAccess()) return RawScan()
        return RawScan(
            media = scanAssets(PHAssetMediaTypeImage, FileKind.PHOTO) +
                scanAssets(PHAssetMediaTypeVideo, FileKind.VIDEO),
            documents = emptyList(), // iOS: documentos ficam no app Arquivos, fora do sandbox
            junk = scanJunk(),
        )
    }

    /** iOS é sempre sandbox — não há limpeza profunda a conceder. */
    actual fun hasDeepCleanAccess(): Boolean = true

    actual fun deleteJunk(files: List<JunkFile>): Pair<Int, Long> {
        var count = 0
        var bytes = 0L
        for (j in files) {
            if (runCatching { FileSystem.SYSTEM.delete(j.path.toPath()); true }.getOrDefault(false)) {
                count++
                bytes += j.size
            }
        }
        return count to bytes
    }

    // ── Galeria (PhotoKit) ────────────────────────────────────────────

    private suspend fun ensurePhotoAccess(): Boolean = suspendCoroutine { cont ->
        when (PHPhotoLibrary.authorizationStatus()) {
            PHAuthorizationStatusAuthorized, PHAuthorizationStatusLimited -> cont.resume(true)
            PHAuthorizationStatusNotDetermined -> PHPhotoLibrary.requestAuthorization { status ->
                cont.resume(
                    status == PHAuthorizationStatusAuthorized ||
                        status == PHAuthorizationStatusLimited
                )
            }
            else -> cont.resume(false)
        }
    }

    private fun scanAssets(mediaType: platform.Photos.PHAssetMediaType, kind: FileKind): List<FileRef> {
        val out = mutableListOf<FileRef>()
        val fetch = PHAsset.fetchAssetsWithMediaType(mediaType, null)
        fetch.enumerateObjectsUsingBlock { obj, _, _ ->
            val asset = obj as? PHAsset ?: return@enumerateObjectsUsingBlock
            val resource = PHAssetResource.assetResourcesForAsset(asset)
                .firstOrNull() as? PHAssetResource
            val name = resource?.originalFilename ?: "item_${asset.localIdentifier}"
            val size = (resource?.valueForKey("fileSize") as? NSNumber)?.longLongValue ?: 0L
            if (size <= 0) return@enumerateObjectsUsingBlock
            out += FileRef(
                id = ASSET_PREFIX + asset.localIdentifier,
                name = name,
                size = size,
                mime = mimeFor(name, kind),
                kind = kind,
            )
        }
        return out
    }

    private fun mimeFor(name: String, kind: FileKind): String =
        when (name.substringAfterLast('.', "").lowercase()) {
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "heic" -> "image/heic"
            "gif" -> "image/gif"
            "webp" -> "image/webp"
            "mov" -> "video/quicktime"
            "mp4" -> "video/mp4"
            else -> if (kind == FileKind.VIDEO) "video/mp4" else "image/jpeg"
        }

    // ── Sujeira (sandbox do app) ──────────────────────────────────────

    private fun scanJunk(): List<JunkFile> {
        val out = mutableListOf<JunkFile>()
        val cachesDir = NSSearchPathForDirectoriesInDomains(
            NSCachesDirectory, NSUserDomainMask, true
        ).firstOrNull() as? String
        val dirs = listOfNotNull(cachesDir, NSTemporaryDirectory())
        for (dir in dirs) {
            runCatching {
                val root = dir.toPath()
                FileSystem.SYSTEM.listRecursively(root).forEach { path ->
                    val meta = FileSystem.SYSTEM.metadataOrNull(path) ?: return@forEach
                    if (meta.isDirectory) return@forEach
                    out += JunkFile(
                        path = path.toString(),
                        size = meta.size ?: 0L,
                        reason = "Cache do app",
                    )
                }
            }
        }
        return out
    }
}

// ── Leitura de conteúdo para upload/hash ─────────────────────────────

@OptIn(ExperimentalForeignApi::class)
actual fun openFileSource(context: PlatformContext, ref: FileRef): Source? {
    if (!ref.id.startsWith(ASSET_PREFIX)) {
        return runCatching { FileSystem.SYSTEM.source(ref.id.toPath()) }.getOrNull()
    }
    val localId = ref.id.removePrefix(ASSET_PREFIX)
    val asset = PHAsset.fetchAssetsWithLocalIdentifiers(listOf(localId), null)
        .firstObject() as? PHAsset ?: return null
    return when (ref.kind) {
        FileKind.VIDEO -> videoFileSource(asset)
        else -> imageDataSource(asset)
    }
}

/** Fotos: bytes originais via PHImageManager (modo síncrono, permite iCloud). */
@OptIn(ExperimentalForeignApi::class)
private fun imageDataSource(asset: PHAsset): Source? {
    var data: NSData? = null
    val options = PHImageRequestOptions().apply {
        synchronous = true
        networkAccessAllowed = true
    }
    PHImageManager.defaultManager().requestImageDataAndOrientationForAsset(
        asset, options
    ) { imageData, _, _, _ ->
        data = imageData
    }
    val bytes = data?.toByteArray() ?: return null
    return Buffer().write(bytes)
}

/** Vídeos: caminho do arquivo original via AVURLAsset, lido em streaming. */
@OptIn(ExperimentalForeignApi::class)
private fun videoFileSource(asset: PHAsset): Source? {
    val semaphore = dispatch_semaphore_create(0)
    var path: String? = null
    val options = PHVideoRequestOptions().apply {
        networkAccessAllowed = true
    }
    PHImageManager.defaultManager().requestAVAssetForVideo(asset, options) { avAsset, _, _ ->
        path = (avAsset as? AVURLAsset)?.URL?.path
        dispatch_semaphore_signal(semaphore)
    }
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER)
    val filePath = path ?: return null
    return runCatching { FileSystem.SYSTEM.source(filePath.toPath()) }.getOrNull()
}

@OptIn(ExperimentalForeignApi::class)
private fun NSData.toByteArray(): ByteArray {
    val size = length.toInt()
    val bytes = ByteArray(size)
    if (size > 0) {
        bytes.usePinned { pinned ->
            memcpy(pinned.addressOf(0), this.bytes, this.length)
        }
    }
    return bytes
}
