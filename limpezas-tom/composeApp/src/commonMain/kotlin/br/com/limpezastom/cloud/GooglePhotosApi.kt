package br.com.limpezastom.cloud

import br.com.limpezastom.model.FileRef
import br.com.limpezastom.platform.PlatformContext
import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

/**
 * Envia fotos e vídeos ao Google Fotos.
 * Fluxo da API: 1) POST /v1/uploads com os bytes → upload token;
 * 2) POST /v1/mediaItems:batchCreate → item criado na biblioteca.
 * Escopo photoslibrary.appendonly: o app só envia, nunca lê sua biblioteca.
 */
class GooglePhotosApi(
    private val http: HttpClient,
    private val context: PlatformContext,
) {
    suspend fun upload(accessToken: String, item: FileRef): Boolean {
        val uploadToken = uploadBytes(accessToken, item) ?: return false
        return createMediaItem(accessToken, uploadToken, item.name)
    }

    private suspend fun uploadBytes(accessToken: String, item: FileRef): String? = runCatching {
        val response = http.post("https://photoslibrary.googleapis.com/v1/uploads") {
            header("Authorization", "Bearer $accessToken")
            header("X-Goog-Upload-Content-Type", item.mime)
            header("X-Goog-Upload-Protocol", "raw")
            setBody(StreamContent(context, item))
        }
        if (!response.status.isSuccess()) return@runCatching null
        response.bodyAsText().takeIf { it.isNotBlank() }
    }.getOrNull()

    private suspend fun createMediaItem(
        accessToken: String,
        uploadToken: String,
        fileName: String,
    ): Boolean = runCatching {
        val body = buildJsonObject {
            put("newMediaItems", buildJsonArray {
                add(buildJsonObject {
                    put("simpleMediaItem", buildJsonObject {
                        put("uploadToken", uploadToken)
                        put("fileName", fileName)
                    })
                })
            })
        }.toString()

        val response = http.post("https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate") {
            header("Authorization", "Bearer $accessToken")
            contentType(ContentType.Application.Json)
            setBody(body)
        }
        if (!response.status.isSuccess()) return@runCatching false

        val status = Json.parseToJsonElement(response.bodyAsText())
            .jsonObject["newMediaItemResults"]
            ?.jsonArray?.firstOrNull()
            ?.jsonObject?.get("status")
            ?.jsonObject
            ?: return@runCatching false
        val message = status["message"]?.jsonPrimitive?.content ?: ""
        val code = status["code"]?.jsonPrimitive?.int ?: 0
        message.equals("Success", ignoreCase = true) || code == 0
    }.getOrDefault(false)
}
