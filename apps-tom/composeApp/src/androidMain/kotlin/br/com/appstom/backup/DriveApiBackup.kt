package br.com.appstom.backup

import android.content.Context
import android.net.Uri
import br.com.appstom.model.FileRef
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Implementação de [BackupSink] que faz upload direto para o Google Drive via REST API.
 *
 * Requer um [accessToken] OAuth 2.0 com escopo `drive.file`, obtido via
 * Identity.getAuthorizationClient() (play-services-auth).
 *
 * Cria (ou reutiliza) uma pasta "Backup - DD-MM-YYYY" na raiz do Meu Drive,
 * e faz upload de cada arquivo via multipart upload com streaming — sem carregar
 * tudo na memória.
 *
 * REQUISITO: o app deve estar cadastrado no Google Cloud Console com Drive API
 * habilitada e um OAuth client ID Android com o package + SHA-1 corretos.
 * Veja: https://console.cloud.google.com/apis/credentials
 */
class DriveApiBackup(
    private val context: Context,
    private val accessToken: String,
) : BackupSink {

    override suspend fun backup(
        files: List<FileRef>,
        onProgress: (Int, Int, String) -> Unit,
    ): String = withContext(Dispatchers.IO) {

        val folderName = SimpleDateFormat("dd-MM-yyyy", Locale("pt", "BR"))
            .format(Date())
            .let { "Backup - $it" }

        // Cria (ou encontra) pasta do dia na raiz do Meu Drive
        val folderId = findOrCreateFolder(folderName)

        // Upload cada arquivo via streaming (sem alocar tudo na memória)
        files.forEachIndexed { i, file ->
            onProgress(i, files.size, file.name)
            runCatching {
                uploadFile(folderId, file.name, file.mime.ifBlank { "image/jpeg" }, Uri.parse(file.id))
            }
        }

        onProgress(files.size, files.size, "")
        folderName
    }

    // ── Pasta ─────────────────────────────────────────────────────────────────

    /**
     * Procura pasta com [name] na raiz do Drive (não lixo).
     * Se já existe (ex: rodou duas vezes hoje), reutiliza; senão cria.
     */
    private fun findOrCreateFolder(name: String): String {
        val q = URLEncoder.encode(
            "name='$name' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            "UTF-8",
        )
        val searchJson = driveGet("https://www.googleapis.com/drive/v3/files?q=$q&fields=files(id)")
        val found = JSONObject(searchJson).optJSONArray("files")
        if (found != null && found.length() > 0) {
            return found.getJSONObject(0).getString("id")
        }

        // Não encontrou — cria
        val body = JSONObject().apply {
            put("name", name)
            put("mimeType", "application/vnd.google-apps.folder")
            // parents omitido → pasta criada na raiz do Meu Drive
        }.toString()
        val created = drivePost("https://www.googleapis.com/drive/v3/files", body, "application/json")
        return JSONObject(created).getString("id")
    }

    // ── Upload ────────────────────────────────────────────────────────────────

    /**
     * Upload multipart via streaming. Não carrega o arquivo na memória —
     * usa [setChunkedStreamingMode] para enviar em partes de 256 KB.
     */
    private fun uploadFile(folderId: String, name: String, mime: String, uri: Uri) {
        val boundary = "lt_boundary_789"
        val metaJson = JSONObject().apply {
            put("name", name)
            put("parents", JSONArray().put(folderId))
        }.toString()

        val url = URL("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Authorization", "Bearer $accessToken")
        conn.setRequestProperty("Content-Type", "multipart/related; boundary=$boundary")
        conn.setChunkedStreamingMode(256 * 1024) // streaming: sem buffer no cliente
        conn.doOutput = true

        conn.outputStream.use { out ->
            // — Parte 1: metadados JSON —
            out.write(
                "--$boundary\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                    .toByteArray(),
            )
            out.write(metaJson.toByteArray())
            out.write("\r\n".toByteArray())

            // — Parte 2: conteúdo do arquivo (stream) —
            out.write("--$boundary\r\nContent-Type: $mime\r\n\r\n".toByteArray())
            context.contentResolver.openInputStream(uri)?.use { inp ->
                inp.copyTo(out, bufferSize = 256 * 1024)
            }
            out.write("\r\n--$boundary--".toByteArray())
        }

        val status = conn.responseCode
        if (status !in 200..299) {
            val err = runCatching { conn.errorStream?.bufferedReader()?.readText() }.getOrNull()
            throw IOException("Upload falhou: HTTP $status — $err")
        }
    }

    // ── HTTP helpers ──────────────────────────────────────────────────────────

    private fun driveGet(urlStr: String): String {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.setRequestProperty("Authorization", "Bearer $accessToken")
        return conn.inputStream.bufferedReader().readText()
    }

    private fun drivePost(urlStr: String, body: String, contentType: String): String {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Authorization", "Bearer $accessToken")
        conn.setRequestProperty("Content-Type", contentType)
        conn.doOutput = true
        conn.outputStream.write(body.toByteArray())
        return runCatching {
            conn.inputStream.bufferedReader().readText()
        }.getOrElse {
            conn.errorStream?.bufferedReader()?.readText() ?: ""
        }
    }
}
