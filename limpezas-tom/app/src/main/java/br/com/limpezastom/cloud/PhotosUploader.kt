package br.com.limpezastom.cloud

import android.content.Context
import android.net.Uri
import br.com.limpezastom.model.MediaItemInfo
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okio.BufferedSink
import okio.source
import org.json.JSONArray
import org.json.JSONObject

/**
 * Envia fotos e vídeos para o Google Fotos.
 *
 * Fluxo da API: 1) POST /v1/uploads com os bytes → upload token;
 * 2) POST /v1/mediaItems:batchCreate com o token → item criado na biblioteca.
 */
class PhotosUploader(
    private val context: Context,
    private val client: OkHttpClient,
) {
    private val octetStream = "application/octet-stream".toMediaType()
    private val json = "application/json".toMediaType()

    fun upload(accessToken: String, item: MediaItemInfo): Boolean {
        val uploadToken = uploadBytes(accessToken, item) ?: return false
        return createMediaItem(accessToken, uploadToken, item.name)
    }

    private fun uploadBytes(accessToken: String, item: MediaItemInfo): String? {
        val request = Request.Builder()
            .url("https://photoslibrary.googleapis.com/v1/uploads")
            .header("Authorization", "Bearer $accessToken")
            .header("X-Goog-Upload-Content-Type", item.mime)
            .header("X-Goog-Upload-Protocol", "raw")
            .post(uriBody(item.uri, item.size))
            .build()
        return runCatching {
            client.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) return null
                resp.body?.string()?.takeIf { it.isNotBlank() }
            }
        }.getOrNull()
    }

    private fun createMediaItem(accessToken: String, uploadToken: String, fileName: String): Boolean {
        val body = JSONObject()
            .put(
                "newMediaItems",
                JSONArray().put(
                    JSONObject().put(
                        "simpleMediaItem",
                        JSONObject()
                            .put("uploadToken", uploadToken)
                            .put("fileName", fileName),
                    )
                ),
            )
            .toString()
        val request = Request.Builder()
            .url("https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate")
            .header("Authorization", "Bearer $accessToken")
            .post(body.toRequestBody(json))
            .build()
        return runCatching {
            client.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) return false
                val result = JSONObject(resp.body?.string() ?: return false)
                val status = result.optJSONArray("newMediaItemResults")
                    ?.optJSONObject(0)
                    ?.optJSONObject("status")
                // Sucesso: message "Success" (ou code ausente/0 no status gRPC)
                status != null && (
                    status.optString("message").equals("Success", ignoreCase = true) ||
                        status.optInt("code", 0) == 0
                    )
            }
        }.getOrDefault(false)
    }

    /** Corpo de requisição que lê direto do ContentResolver, sem carregar tudo na memória. */
    private fun uriBody(uri: Uri, size: Long): RequestBody = object : RequestBody() {
        override fun contentType() = octetStream
        override fun contentLength() = size
        override fun writeTo(sink: BufferedSink) {
            context.contentResolver.openInputStream(uri)?.use { input ->
                sink.writeAll(input.source())
            } ?: throw java.io.IOException("Não foi possível abrir $uri")
        }
    }
}
