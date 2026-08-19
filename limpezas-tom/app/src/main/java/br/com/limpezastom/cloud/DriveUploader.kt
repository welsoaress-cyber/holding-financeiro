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
import org.json.JSONObject

/**
 * Envia documentos para o Google Drive, dentro da pasta "Limpezas Tom"
 * (criada automaticamente na primeira vez). Usa o escopo drive.file,
 * que só dá acesso aos arquivos criados pelo próprio app.
 */
class DriveUploader(
    private val context: Context,
    private val client: OkHttpClient,
) {
    private val json = "application/json".toMediaType()
    private var folderId: String? = null

    companion object {
        const val FOLDER_NAME = "Limpezas Tom"
    }

    fun upload(accessToken: String, doc: DocumentInfo): Boolean {
        val parent = ensureFolder(accessToken) ?: return false
        val metadata = JSONObject()
            .put("name", doc.name)
            .put("parents", org.json.JSONArray().put(parent))
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

    private fun ensureFolder(accessToken: String): String? {
        folderId?.let { return it }
        val query = "mimeType='application/vnd.google-apps.folder' " +
            "and name='$FOLDER_NAME' and trashed=false"
        val url = "https://www.googleapis.com/drive/v3/files".toHttpUrl()
            .newBuilder()
            .addQueryParameter("q", query)
            .addQueryParameter("fields", "files(id,name)")
            .build()
        val existing = runCatching {
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
        if (existing != null) {
            folderId = existing
            return existing
        }
        // Cria a pasta
        val metadata = JSONObject()
            .put("name", FOLDER_NAME)
            .put("mimeType", "application/vnd.google-apps.folder")
            .toString()
        return runCatching {
            client.newCall(
                Request.Builder()
                    .url("https://www.googleapis.com/drive/v3/files")
                    .header("Authorization", "Bearer $accessToken")
                    .post(metadata.toRequestBody(json))
                    .build()
            ).execute().use { resp ->
                if (!resp.isSuccessful) return@runCatching null
                JSONObject(resp.body?.string() ?: return@runCatching null)
                    .optString("id")
                    .takeIf { it.isNotBlank() }
                    ?.also { folderId = it }
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
