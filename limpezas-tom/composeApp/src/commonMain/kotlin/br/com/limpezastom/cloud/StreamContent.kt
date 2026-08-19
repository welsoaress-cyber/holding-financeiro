package br.com.limpezastom.cloud

import br.com.limpezastom.model.FileRef
import br.com.limpezastom.platform.PlatformContext
import br.com.limpezastom.platform.openFileSource
import io.ktor.http.ContentType
import io.ktor.http.content.OutgoingContent
import io.ktor.utils.io.ByteWriteChannel
import io.ktor.utils.io.writeFully
import okio.Buffer
import okio.IOException
import okio.use

/**
 * Corpo de requisição que lê o arquivo em streaming pelo canal da
 * plataforma (ContentResolver no Android, PhotoKit/arquivo no iOS),
 * sem carregar tudo na memória.
 */
class StreamContent(
    private val context: PlatformContext,
    private val ref: FileRef,
    private val type: ContentType = ContentType.Application.OctetStream,
) : OutgoingContent.WriteChannelContent() {

    override val contentType: ContentType get() = type
    override val contentLength: Long get() = ref.size

    override suspend fun writeTo(channel: ByteWriteChannel) {
        val source = openFileSource(context, ref)
            ?: throw IOException("Não foi possível abrir ${ref.name}")
        source.use { src ->
            val buffer = Buffer()
            while (true) {
                val read = src.read(buffer, 64L * 1024)
                if (read == -1L) break
                channel.writeFully(buffer.readByteArray())
            }
        }
    }
}
