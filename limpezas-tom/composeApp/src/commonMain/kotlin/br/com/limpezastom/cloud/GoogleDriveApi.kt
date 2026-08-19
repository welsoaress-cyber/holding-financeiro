package br.com.limpezastom.cloud

import br.com.limpezastom.model.FileRef
import br.com.limpezastom.platform.PlatformContext
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

/**
 * Envia documentos ao Google Drive, organizados de verdade:
 *
 *   Limpezas Tom / <Tipo> / <Ano> / arquivo
 *
 * Ex.: "Limpezas Tom/Planilhas/2023/orcamento.xlsx". As pastas são criadas
 * conforme necessário. Escopo drive.file: o app só enxerga e mexe nos
 * arquivos que ele mesmo criou — nunca no resto do seu Drive.
 */
class GoogleDriveApi(
    private val http: HttpClient,
    private val context: PlatformContext,
) {
    /** Cache caminho → id da pasta no Drive (ex.: "Limpezas Tom/PDFs/2021"). */
    private val folderIds = mutableMapOf<String, String>()

    companion object {
        const val ROOT_FOLDER = "Limpezas Tom"
    }

    suspend fun upload(accessToken: String, doc: FileRef): Boolean = runCatching {
        val parent = ensurePath(accessToken, ROOT_FOLDER, typeLabel(doc.name), yearOf(doc))
            ?: return@runCatching false

        // 1) Cria o arquivo (só metadados) na pasta certa
        val metadata = buildJsonObject {
            put("name", doc.name)
            put("parents", buildJsonArray { add(kotlinx.serialization.json.JsonPrimitive(parent)) })
        }.toString()
        val created = http.post("https://www.googleapis.com/drive/v3/files") {
            header("Authorization", "Bearer $accessToken")
            contentType(ContentType.Application.Json)
            setBody(metadata)
        }
        if (!created.status.isSuccess()) return@runCatching false
        val fileId = Json.parseToJsonElement(created.bodyAsText())
            .jsonObject["id"]?.jsonPrimitive?.content
            ?.takeIf { it.isNotBlank() }
            ?: return@runCatching false

        // 2) Envia o conteúdo em streaming
        val uploaded = http.patch(
            "https://www.googleapis.com/upload/drive/v3/files/$fileId"
        ) {
            parameter("uploadType", "media")
            header("Authorization", "Bearer $accessToken")
            setBody(StreamContent(context, doc))
        }
        uploaded.status.isSuccess()
    }.getOrDefault(false)

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

    private fun yearOf(doc: FileRef): String {
        if (doc.modifiedEpochSeconds <= 0) return "Sem data"
        return Instant.fromEpochSeconds(doc.modifiedEpochSeconds)
            .toLocalDateTime(TimeZone.currentSystemDefault())
            .year
            .toString()
    }

    /** Garante a cadeia de pastas e devolve o id da última. */
    private suspend fun ensurePath(accessToken: String, vararg segments: String): String? {
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

    private suspend fun findFolder(accessToken: String, name: String, parentId: String?): String? =
        runCatching {
            val safeName = name.replace("'", "\\'")
            var query = "mimeType='application/vnd.google-apps.folder' " +
                "and name='$safeName' and trashed=false"
            if (parentId != null) query += " and '$parentId' in parents"
            val response = http.get("https://www.googleapis.com/drive/v3/files") {
                parameter("q", query)
                parameter("fields", "files(id,name)")
                header("Authorization", "Bearer $accessToken")
            }
            if (!response.status.isSuccess()) return@runCatching null
            Json.parseToJsonElement(response.bodyAsText())
                .jsonObject["files"]
                ?.jsonArray?.firstOrNull()
                ?.jsonObject?.get("id")
                ?.jsonPrimitive?.content
                ?.takeIf { it.isNotBlank() }
        }.getOrNull()

    private suspend fun createFolder(accessToken: String, name: String, parentId: String?): String? =
        runCatching {
            val metadata = buildJsonObject {
                put("name", name)
                put("mimeType", "application/vnd.google-apps.folder")
                if (parentId != null) {
                    put("parents", buildJsonArray { add(kotlinx.serialization.json.JsonPrimitive(parentId)) })
                }
            }.toString()
            val response = http.post("https://www.googleapis.com/drive/v3/files") {
                header("Authorization", "Bearer $accessToken")
                contentType(ContentType.Application.Json)
                setBody(metadata)
            }
            if (!response.status.isSuccess()) return@runCatching null
            Json.parseToJsonElement(response.bodyAsText())
                .jsonObject["id"]?.jsonPrimitive?.content
                ?.takeIf { it.isNotBlank() }
        }.getOrNull()
}
