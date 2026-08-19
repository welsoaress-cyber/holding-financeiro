package br.com.limpezastom.logic

import br.com.limpezastom.model.FileRef
import br.com.limpezastom.platform.PlatformContext
import br.com.limpezastom.platform.openFileSource
import okio.Buffer
import okio.HashingSource
import okio.use

/**
 * Fotos/vídeos com mesmo tamanho e mesmo conteúdo (hash SHA-256 dos
 * primeiros 256 KB). O primeiro de cada grupo é mantido; os demais são
 * apontados como duplicatas — nada é apagado, só listado.
 */
class DuplicateFinder(private val context: PlatformContext) {

    fun find(media: List<FileRef>): List<FileRef> {
        val duplicates = mutableListOf<FileRef>()
        val bySize = media.groupBy { it.size }.filterValues { it.size > 1 }
        for (group in bySize.values) {
            val byHash = mutableMapOf<String, FileRef>()
            for (item in group) {
                val hash = contentHash(item) ?: continue
                if (byHash.containsKey(hash)) duplicates += item
                else byHash[hash] = item
            }
        }
        return duplicates
    }

    private fun contentHash(ref: FileRef): String? = runCatching {
        val source = openFileSource(context, ref) ?: return null
        HashingSource.sha256(source).use { hashing ->
            val sink = Buffer()
            var remaining = 256L * 1024
            while (remaining > 0) {
                val read = hashing.read(sink, minOf(64L * 1024, remaining))
                if (read == -1L) break
                remaining -= read
                sink.clear()
            }
            hashing.hash.hex()
        }
    }.getOrNull()
}
