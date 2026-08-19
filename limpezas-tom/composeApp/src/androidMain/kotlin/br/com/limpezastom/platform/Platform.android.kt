package br.com.limpezastom.platform

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.StatFs
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
 * Varredura Android: MediaStore para mídia (fotos, vídeos, áudios) e
 * documentos; sistema de arquivos para sujeira (com acesso total, quando concedido).
 */
actual class DeviceScanner actual constructor(private val context: PlatformContext) {

    actual suspend fun scanRaw(): RawScan = withContext(Dispatchers.IO) {
        val stat = runCatching {
            StatFs(Environment.getExternalStorageDirectory().absolutePath)
        }.getOrNull()
        val total = stat?.totalBytes ?: 0L
        val free  = stat?.freeBytes  ?: 0L

        RawScan(
            media = scanMedia(),
            documents = scanDocuments(),
            junk = scanJunk(),
            totalStorageBytes = total,
            freeStorageBytes = free,
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

    // ── Fotos e vídeos e áudios ───────────────────────────────────────────────

    private fun scanMedia(): List<FileRef> =
        queryMedia(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, FileKind.PHOTO) +
            queryMedia(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, FileKind.VIDEO) +
            queryAudio()

    private fun queryMedia(collection: Uri, kind: FileKind): List<FileRef> {
        val out = mutableListOf<FileRef>()
        val hasDuration = kind == FileKind.VIDEO
        val projection = buildList {
            add(MediaStore.MediaColumns._ID)
            add(MediaStore.MediaColumns.DISPLAY_NAME)
            add(MediaStore.MediaColumns.SIZE)
            add(MediaStore.MediaColumns.MIME_TYPE)
            add(MediaStore.MediaColumns.DATE_MODIFIED)
            add(MediaStore.MediaColumns.RELATIVE_PATH)
            if (hasDuration) add(MediaStore.Video.Media.DURATION)
        }.toTypedArray()

        runCatching {
            context.contentResolver.query(
                collection, projection, null, null,
                "${MediaStore.MediaColumns.DATE_ADDED} DESC",
            )?.use { c ->
                val idCol       = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                val nameCol     = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
                val sizeCol     = c.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                val mimeCol     = c.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE)
                val dateCol     = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_MODIFIED)
                val pathCol     = c.getColumnIndex(MediaStore.MediaColumns.RELATIVE_PATH)
                val durationCol = if (hasDuration) c.getColumnIndex(MediaStore.Video.Media.DURATION) else -1

                while (c.moveToNext()) {
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue

                    val name = c.getString(nameCol) ?: "sem_nome"
                    val relativePath = if (pathCol >= 0) c.getString(pathCol) ?: "" else ""
                    val isScreenshot = relativePath.contains("screenshot", ignoreCase = true)
                        || name.contains("screenshot", ignoreCase = true)
                        || name.startsWith("SCR_", ignoreCase = true)

                    val durationMs = if (durationCol >= 0 && !c.isNull(durationCol))
                        c.getLong(durationCol).takeIf { it > 0 } else null

                    out += FileRef(
                        id   = ContentUris.withAppendedId(collection, c.getLong(idCol)).toString(),
                        name = name,
                        size = size,
                        mime = c.getString(mimeCol)
                            ?: if (kind == FileKind.VIDEO) "video/mp4" else "image/jpeg",
                        kind = kind,
                        lastModifiedMs = c.getLong(dateCol) * 1000L,  // epoch seconds → ms
                        isScreenshot   = isScreenshot,
                        durationMs     = durationMs,
                        isNomedia      = false,   // MediaStore não indexa dirs com .nomedia
                    )
                }
            }
        }
        return out
    }

    private fun queryAudio(): List<FileRef> {
        val out = mutableListOf<FileRef>()
        val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.MIME_TYPE,
            MediaStore.Audio.Media.DATE_MODIFIED,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.IS_MUSIC,
        )
        runCatching {
            context.contentResolver.query(collection, projection, null, null, null)?.use { c ->
                val idCol       = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val nameCol     = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
                val sizeCol     = c.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val mimeCol     = c.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)
                val dateCol     = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_MODIFIED)
                val durCol      = c.getColumnIndex(MediaStore.Audio.Media.DURATION)
                val musicCol    = c.getColumnIndex(MediaStore.Audio.Media.IS_MUSIC)

                while (c.moveToNext()) {
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue
                    // Músicas conhecidas do usuário não são sugeridas para exclusão
                    val isMusic = musicCol >= 0 && c.getInt(musicCol) != 0
                    if (isMusic) continue

                    out += FileRef(
                        id           = ContentUris.withAppendedId(collection, c.getLong(idCol)).toString(),
                        name         = c.getString(nameCol) ?: "audio",
                        size         = size,
                        mime         = c.getString(mimeCol) ?: "audio/mpeg",
                        kind         = FileKind.AUDIO,
                        lastModifiedMs = c.getLong(dateCol) * 1000L,
                        durationMs   = if (durCol >= 0) c.getLong(durCol).takeIf { it > 0 } else null,
                        wasPlayed    = false,   // MediaStore não expõe histórico de reprodução
                    )
                }
            }
        }
        return out
    }

    // ── Documentos ────────────────────────────────────────────────────────────

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
                val idCol   = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID)
                val nameCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val sizeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)
                val mimeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MIME_TYPE)
                val dateCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DATE_MODIFIED)
                while (c.moveToNext()) {
                    val name = c.getString(nameCol) ?: continue
                    val ext  = name.substringAfterLast('.', "").lowercase()
                    if (ext !in docExtensions) continue
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue
                    out += FileRef(
                        id   = ContentUris.withAppendedId(collection, c.getLong(idCol)).toString(),
                        name = name,
                        size = size,
                        mime = c.getString(mimeCol) ?: "application/octet-stream",
                        kind = FileKind.DOCUMENT,
                        lastModifiedMs = c.getLong(dateCol) * 1000L,
                    )
                }
            }
        }
        return out
    }

    // ── Sujeira ───────────────────────────────────────────────────────────────

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
                    !(dir.name == "data" || dir.name == "obb") ||
                        dir.parentFile?.name != "Android"
                }
                .filter { it.isFile }
                .forEach { f ->
                    val ext = f.extension.lowercase()
                    val reason = when {
                        f.name == ".nomedia"              -> null   // marcador do Android — nunca é sujeira
                        ext in junkExtensions             -> "Arquivos temporários"
                        f.name.startsWith(".trashed-")   -> "Lixeira do sistema"
                        f.parentFile?.name == ".thumbnails" -> "Miniaturas antigas"
                        f.length() == 0L                 -> "Arquivos vazios"
                        f.name == ".DS_Store"            -> "Artefato macOS"
                        f.name.startsWith("._")          -> "Metadado macOS"
                        else                             -> null
                    }
                    if (reason != null) out += JunkFile(f.absolutePath, f.length(), reason)
                }
        }
        return out
    }
}
