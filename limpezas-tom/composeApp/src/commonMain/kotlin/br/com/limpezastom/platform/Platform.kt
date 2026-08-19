package br.com.limpezastom.platform

import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.RawScan
import okio.Source

/** Contexto de plataforma: Context no Android, vazio no iOS. */
expect class PlatformContext

/**
 * Varredura e limpeza específicas de cada sistema.
 * Android: MediaStore + sistema de arquivos. iOS: PhotoKit + sandbox do app.
 */
expect class DeviceScanner(context: PlatformContext) {
    /** Varre mídia, documentos e sujeira. Não altera nenhum arquivo. */
    suspend fun scanRaw(): RawScan

    /** Se a plataforma permite limpeza profunda fora das pastas de mídia. */
    fun hasDeepCleanAccess(): Boolean

    /**
     * Apaga arquivos de sujeira JÁ REVISADOS E APROVADOS pelo usuário.
     * Nunca chamar sem confirmação explícita. Retorna (quantidade, bytes).
     */
    fun deleteJunk(files: List<JunkFile>): Pair<Int, Long>
}

/** Abre o conteúdo de um arquivo para leitura em streaming (upload/hash). */
expect fun openFileSource(context: PlatformContext, ref: br.com.limpezastom.model.FileRef): Source?
