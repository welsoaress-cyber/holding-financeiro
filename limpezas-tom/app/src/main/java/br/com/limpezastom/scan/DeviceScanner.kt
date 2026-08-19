package br.com.limpezastom.scan

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import br.com.limpezastom.model.DocumentInfo
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.MediaItemInfo
import br.com.limpezastom.model.ScanReport
import java.io.File
import java.security.MessageDigest

/**
 * Varre o aparelho em busca de fotos/vídeos, documentos, sujeira e duplicados.
 */
class DeviceScanner(private val context: Context) {

    fun fullScan(): ScanReport {
        val media = scanMedia()
        return ScanReport(
            media = media,
            documents = scanDocuments(),
            junk = scanJunk(),
            duplicates = findDuplicates(media),
        )
    }

    // ── Fotos e vídeos ────────────────────────────────────────────────

    fun scanMedia(): List<MediaItemInfo> =
        queryMedia(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, isVideo = false) +
            queryMedia(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, isVideo = true)

    private fun queryMedia(collection: Uri, isVideo: Boolean): List<MediaItemInfo> {
        val out = mutableListOf<MediaItemInfo>()
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
                    out += MediaItemInfo(
                        uri = ContentUris.withAppendedId(collection, c.getLong(idCol)),
                        name = c.getString(nameCol) ?: "sem_nome",
                        size = size,
                        mime = c.getString(mimeCol)
                            ?: if (isVideo) "video/mp4" else "image/jpeg",
                        isVideo = isVideo,
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

    fun scanDocuments(): List<DocumentInfo> {
        val out = mutableListOf<DocumentInfo>()
        val collection = MediaStore.Files.getContentUri("external")
        val projection = arrayOf(
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.DISPLAY_NAME,
            MediaStore.Files.FileColumns.SIZE,
            MediaStore.Files.FileColumns.MIME_TYPE,
        )
        runCatching {
            context.contentResolver.query(collection, projection, null, null, null)?.use { c ->
                val idCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID)
                val nameCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DISPLAY_NAME)
                val sizeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.SIZE)
                val mimeCol = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MIME_TYPE)
                while (c.moveToNext()) {
                    val name = c.getString(nameCol) ?: continue
                    val ext = name.substringAfterLast('.', "").lowercase()
                    if (ext !in docExtensions) continue
                    val size = c.getLong(sizeCol)
                    if (size <= 0) continue
                    out += DocumentInfo(
                        uri = ContentUris.withAppendedId(collection, c.getLong(idCol)),
                        name = name,
                        size = size,
                        mime = c.getString(mimeCol) ?: "application/octet-stream",
                    )
                }
            }
        }
        return out
    }

    // ── Sujeira ───────────────────────────────────────────────────────

    private val junkExtensions = setOf("tmp", "log", "bak", "old", "part", "crdownload", "download")

    /** Sujeira fora das pastas do app só é visível com acesso total a arquivos. */
    fun hasAllFilesAccess(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.R || Environment.isExternalStorageManager()

    fun scanJunk(): List<JunkFile> {
        val out = mutableListOf<JunkFile>()

        // Cache do próprio app — sempre acessível
        for (dir in listOfNotNull(context.cacheDir, context.externalCacheDir)) {
            dir.walkTopDown().filter { it.isFile }.forEach {
                out += JunkFile(it, it.length(), "Cache do app")
            }
        }

        if (!hasAllFilesAccess()) return out

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
                        ext in junkExtensions -> "Arquivo temporário"
                        f.name.startsWith(".trashed-") -> "Lixeira do sistema"
                        f.parentFile?.name == ".thumbnails" -> "Miniaturas antigas"
                        f.length() == 0L -> "Arquivo vazio"
                        else -> null
                    }
                    if (reason != null) out += JunkFile(f, f.length(), reason)
                }
        }
        return out
    }

    /** Apaga os arquivos de sujeira. Retorna (quantidade, bytes liberados). */
    fun deleteJunk(junk: List<JunkFile>): Pair<Int, Long> {
        var count = 0
        var bytes = 0L
        for (j in junk) {
            if (runCatching { j.file.delete() }.getOrDefault(false)) {
                count++
                bytes += j.size
            }
        }
        return count to bytes
    }

    // ── Duplicados ────────────────────────────────────────────────────

    /**
     * Fotos/vídeos com mesmo tamanho e mesmo conteúdo (hash dos primeiros
     * 256 KB). O primeiro de cada grupo é mantido; os demais são duplicatas.
     */
    fun findDuplicates(media: List<MediaItemInfo>): List<MediaItemInfo> {
        val duplicates = mutableListOf<MediaItemInfo>()
        val bySize = media.groupBy { it.size }.filterValues { it.size > 1 }
        for (group in bySize.values) {
            val byHash = mutableMapOf<String, MediaItemInfo>()
            for (item in group) {
                val hash = contentHash(item.uri) ?: continue
                if (byHash.containsKey(hash)) duplicates += item
                else byHash[hash] = item
            }
        }
        return duplicates
    }

    private fun contentHash(uri: Uri): String? = runCatching {
        context.contentResolver.openInputStream(uri)?.use { input ->
            val digest = MessageDigest.getInstance("SHA-256")
            val buffer = ByteArray(64 * 1024)
            var remaining = 256 * 1024
            while (remaining > 0) {
                val read = input.read(buffer, 0, minOf(buffer.size, remaining))
                if (read <= 0) break
                digest.update(buffer, 0, read)
                remaining -= read
            }
            digest.digest().joinToString("") { "%02x".format(it) }
        }
    }.getOrNull()
}
