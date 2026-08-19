package br.com.limpezastom.cloud

import android.content.Context
import android.net.Uri
import br.com.limpezastom.model.DocumentInfo
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okio.BufferedSink
import okio.source
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.TimeZone

/**
 * Envia documentos para o Google Drive, organizados de verdade:
 *
 *   Limpezas Tom / <Tipo> / <Ano> / arquivo
 *
 * Ex.: "Limpezas Tom/Planilhas/2023/orcamento.xlsx". As pastas são criadas
 * conforme necessário. Usa o escopo drive.file: o app só enxerga e mexe
 * nos arquivos que ele mesmo criou — nunca no resto do seu Drive.
 */
class DriveUploader(
    private val context: Context,
    private val client: OkHttpClient,
) {
    private val json = "application/json".toMediaType()

    /** Cache caminho → id da pasta no Drive (ex.: "Limpezas Tom/PDFs/2021"). */
    private val folderIds = mutableMapOf<String, String>()

    companion object {
        const val ROOT_FOLDER = "Limpezas Tom"
    }

    fun upload(accessToken: String, doc: DocumentInfo): Boolean {
        val parent = ensurePath(accessToken, ROOT_FOLDER, typeLabel(doc.name), yearOf(doc))
            ?: return false
        val metadata = JSONObject()
            .put("name", doc.name)
            .put("parents", JSONArray().put(parent))
            .toString()
        val body = MultipartBody.Builder()
            .setType("multipart/related".toMediaType())
            .addPart(metadata.toRequestBody(json))
            .addPart(uriBody(doc.uri, doc.mime, doc.size))
            .build()
        val request = Request.Builder()
            .url("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart")
            .header("Authorization", "Bearer $accessToken")
            .post(body)
            .build()
        return runCatching {
            client.newCall(request).execute().use { it.isSuccessful }
        }.getOrDefault(false)
    }

    // ── Organização ───────────────────────────────────────────────────

    private fun typeLabel(fileName: String): String =
        when (fileName.substringAfterLast('.', "").lowercase()) {
            "pdf" -> "PDFs"
            "doc", "docx", "odt", "rtf", "txt" -> "Documentos de texto"
            "xls", "xlsx", "ods", "csv" -> "Planilhas"
            "ppt", "pptx", "odp" -> "Apresentações"
            "epub" -> "Livros"
            else -> "Outros"
        }

    private fun yearOf(doc: DocumentInfo): String {
        if (doc.modifiedEpochSeconds <= 0) return "Sem data"
        val cal = Calendar.getInstance(TimeZone.getDefault())
        cal.timeInMillis = doc.modifiedEpochSeconds * 1000
        return cal.get(Calendar.YEAR).toString()
    }

    /** Garante a cadeia de pastas e devolve o id da última. */
    private fun ensurePath(accessToken: String, vararg segments: String): String? {
        var parentId: String? = null // null = raiz do Drive
        var path = ""
        for (segment in segments) {
            path = if (path.isEmpty()) segment else "$path/$segment"
            val cached = folderIds[path]
            if (cached != null) {
                parentId = cached
                continue
            }
            val id = findFolder(accessToken, segment, parentId)
                ?: createFolder(accessToken, segment, parentId)
                ?: return null
            folderIds[path] = id
            parentId = id
        }
        return parentId
    }

    private fun findFolder(accessToken: String, name: String, parentId: String?): String? {
        val safeName = name.replace("'", "\\'")
        var query = "mimeType='application/vnd.google-apps.folder' " +
            "and name='$safeName' and trashed=false"
        if (parentId != null) query += " and '$parentId' in parents"
        val url = "https://www.googleapis.com/drive/v3/files".toHttpUrl()
            .newBuilder()
            .addQueryParameter("q", query)
            .addQueryParameter("fields", "files(id,name)")
            .build()
        return runCatching {
            client.newCall(
                Request.Builder().url(url)
                    .header("Authorization", "Bearer $accessToken")
                    .get().build()
            ).execute().use { resp ->
                if (!resp.isSuccessful) return@runCatching null
                JSONObject(resp.body?.string() ?: return@runCatching null)
                    .optJSONArray("files")
                    ?.optJSONObject(0)
                    ?.optString("id")
                    ?.takeIf { it.isNotBlank() }
            }
        }.getOrNull()
    }

    private fun createFolder(accessToken: String, name: String, parentId: String?): String? {
        val metadata = JSONObject()
            .put("name", name)
            .put("mimeType", "application/vnd.google-apps.folder")
        if (parentId != null) metadata.put("parents", JSONArray().put(parentId))
        return runCatching {
            client.newCall(
                Request.Builder()
                    .url("https://www.googleapis.com/drive/v3/files")
                    .header("Authorization", "Bearer $accessToken")
                    .post(metadata.toString().toRequestBody(json))
                    .build()
            ).execute().use { resp ->
                if (!resp.isSuccessful) return@runCatching null
                JSONObject(resp.body?.string() ?: return@runCatching null)
                    .optString("id")
                    .takeIf { it.isNotBlank() }
            }
        }.getOrNull()
    }

    private fun uriBody(uri: Uri, mime: String, size: Long): RequestBody = object : RequestBody() {
        override fun contentType() =
            mime.toMediaTypeOrNull() ?: "application/octet-stream".toMediaType()
        override fun contentLength() = size
        override fun writeTo(sink: BufferedSink) {
            context.contentResolver.openInputStream(uri)?.use { input ->
                sink.writeAll(input.source())
            } ?: throw java.io.IOException("Não foi possível abrir $uri")
        }
    }
}
