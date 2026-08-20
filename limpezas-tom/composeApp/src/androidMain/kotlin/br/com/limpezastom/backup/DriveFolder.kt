package br.com.limpezastom.backup

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import br.com.limpezastom.model.FileRef
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Implementação de [BackupSink] usando o Storage Access Framework do Android.
 *
 * O usuário escolhe uma pasta raiz (qualquer provider: Google Drive, SD card, etc.)
 * via ACTION_OPEN_DOCUMENT_TREE. Esta classe cria uma subpasta com nome e data/hora
 * e copia os arquivos para lá via DocumentsContract — sem OAuth, sem chave de API.
 *
 * [treeUri]: URI persistida após takePersistableUriPermission.
 */
class DriveFolder(
    private val context: Context,
    private val treeUri: Uri,
) : BackupSink {

    override suspend fun backup(
        files: List<FileRef>,
        onProgress: (Int, Int, String) -> Unit,
    ): String = withContext(Dispatchers.IO) {

        // Nome da pasta: "Backup - 20-08-2025 01h30"
        val folderName = SimpleDateFormat("dd-MM-yyyy HH'h'mm", Locale("pt", "BR"))
            .format(Date())
            .let { "Backup - $it" }

        // Raiz da árvore escolhida pelo usuário
        val parentDocId = DocumentsContract.getTreeDocumentId(treeUri)
        val parentUri   = DocumentsContract.buildDocumentUriUsingTree(treeUri, parentDocId)

        // Cria subpasta
        val subfolderUri = runCatching {
            DocumentsContract.createDocument(
                context.contentResolver,
                parentUri,
                DocumentsContract.Document.MIME_TYPE_DIR,
                folderName,
            )
        }.getOrNull() ?: return@withContext folderName

        // Copia cada arquivo
        files.forEachIndexed { i, file ->
            onProgress(i, files.size, file.name)
            runCatching {
                val outUri = DocumentsContract.createDocument(
                    context.contentResolver,
                    subfolderUri,
                    file.mime.ifBlank { "image/jpeg" },
                    file.name,
                ) ?: return@runCatching
                context.contentResolver.openOutputStream(outUri)?.use { out ->
                    context.contentResolver.openInputStream(Uri.parse(file.id))?.use { inp ->
                        inp.copyTo(out, bufferSize = 256 * 1024)
                    }
                }
            }
        }

        onProgress(files.size, files.size, "")
        folderName
    }
}
