package br.com.limpezastom.platform

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import br.com.limpezastom.model.FileKind
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.RawScan
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okio.Source
import okio.source
import java.io.File

actual typealias PlatformContext = Context

/** Abre content:// URIs (mídia e documentos) via ContentResolver. */
actual fun openFileSource(context: PlatformContext, ref: FileRef): Source? = runCatching {
    context.contentResolver.openInputStream(Uri.parse(ref.id))?.source()
}.getOrNull()

/**
 * Varredura Android: MediaStore para mídia e documentos; sistema de
 * arquivos para sujeira (com acesso total, quando concedido).
 */
actual class DeviceScanner actual constructor(private val context: PlatformContext) {

    actual suspend fun scanRaw(): RawScan = withContext(Dispatchers.IO) {
        RawScan(
            media = scanMedia(),
            documents = scanDocuments(),
            junk = scanJunk(),
        )
    }

    actual fun hasDeepCleanAccess(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.R || Environment.isExternalStorageManager()

    actual fun deleteJunk(files: List<JunkFile>): Pair<Int, Long> {
        var count = 0
        var bytes = 0L
        for (j in files) {
            if (runCatching { File(j.path).delete() }.getOrDefault(false)) {
                count++
                bytes += j.size
            }
        }
        return count to bytes
    }

    // ── Fotos e vídeos ────────────────────────────────────────────────

    private fun scanMedia(): List<FileRef> =
        queryMedia(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, FileKind.PHOTO) +
            queryMedia(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, FileKind.VIDEO)

    private fun queryMedia(collection: Uri, kind: FileKind): List<FileRef> {
        val out = mutableListOf<FileRef>()
        val projection = arrayOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.MIME_TYPE,
        )
        runCatching {
            context.contentResolver.query(
                collection, projection, null, null,
                "${MediaStore.MediaColumns.DATE_ADDED} DESC",
            )?.use { c ->
                val idCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                val nameCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
                val sizeCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                val mimeCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE)
                while (c.moveToNext()) {
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue
                    out += FileRef(
                        id = ContentUris.withAppendedId(collection, c.getLong(idCol)).toString(),
                        name = c.getString(nameCol) ?: "sem_nome",
                        size = size,
                        mime = c.getString(mimeCol)
                            ?: if (kind == FileKind.VIDEO) "video/mp4" else "image/jpeg",
                        kind = kind,
                    )
                }
            }
        }
        return out
    }

    // ── Documentos ────────────────────────────────────────────────────

    private val docExtensions = setOf(
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "txt", "csv", "odt", "ods", "odp", "rtf", "epub",
    )

    private fun scanDocuments(): List<FileRef> {
        val out = mutableListOf<FileRef>()
        val collection = MediaStore.Files.getContentUri("external")
        val projection = arrayOf(
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.SIZE,
            MediaStore.Files.FileColumns.MIME_TYPE,
            MediaStore.Files.FileColumns.DATE_MODIFIED,
        )
        runCatching {
            context.contentResolver.query(collection, projection, null, null, null)?.use { c ->
                val idCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID)
                val nameCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val sizeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)
                val mimeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MIME_TYPE)
                val dateCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DATE_MODIFIED)
                while (c.moveToNext()) {
                    val name = c.getString(nameCol) ?: continue
                    val ext = name.substringAfterLast('.', "").lowercase()
                    if (ext !in docExtensions) continue
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue
                    out += FileRef(
                        id = ContentUris.withAppendedId(collection, c.getLong(idCol)).toString(),
                        name = name,
                        size = size,
                        mime = c.getString(mimeCol) ?: "application/octet-stream",
                        kind = FileKind.DOCUMENT,
                        modifiedEpochSeconds = c.getLong(dateCol),
                    )
                }
            }
        }
        return out
    }

    // ── Sujeira ───────────────────────────────────────────────────────

    private val junkExtensions = setOf("tmp", "log", "bak", "old", "part", "crdownload", "download")

    private fun scanJunk(): List<JunkFile> {
        val out = mutableListOf<JunkFile>()

        // Cache do próprio app — sempre acessível
        for (dir in listOfNotNull(context.cacheDir, context.externalCacheDir)) {
            dir.walkTopDown().filter { it.isFile }.forEach {
                out += JunkFile(it.absolutePath, it.length(), "Cache do app")
            }
        }

        if (!hasDeepCleanAccess()) return out

        val root = Environment.getExternalStorageDirectory() ?: return out
        runCatching {
            root.walkTopDown()
                .onEnter { dir ->
                    // Android/data e Android/obb são bloqueados pelo sistema
                    !(dir.name == "data" || dir.name == "obb") ||
                        dir.parentFile?.name != "Android"
                }
                .filter { it.isFile }
                .forEach { f ->
                    val ext = f.extension.lowercase()
                    val reason = when {
                        // .nomedia é um marcador do Android — nunca é sujeira
                        f.name == ".nomedia" -> null
                        ext in junkExtensions -> "Arquivos temporários"
                        f.name.startsWith(".trashed-") -> "Lixeira do sistema"
                        f.parentFile?.name == ".thumbnails" -> "Miniaturas antigas"
                        f.length() == 0L -> "Arquivos vazios"
                        else -> null
                    }
                    if (reason != null) out += JunkFile(f.absolutePath, f.length(), reason)
                }
        }
        return out
    }
}
