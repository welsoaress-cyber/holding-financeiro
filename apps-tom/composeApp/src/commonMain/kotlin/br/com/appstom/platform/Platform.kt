package br.com.appstom.platform

import br.com.appstom.model.DuplicateShortcutGroup
import br.com.appstom.model.JunkFile
import br.com.appstom.model.RawScan
import okio.Source

/** Contexto de plataforma: Context no Android, vazio no iOS. */
expect abstract class PlatformContext

/**
 * Varredura e limpeza específicas de cada sistema.
 * Android: MediaStore + sistema de arquivos. iOS: PhotoKit + sandbox do app.
 */
expect class DeviceScanner(context: PlatformContext) {
    /** Varre mídia, documentos e sujeira. Não altera nenhum arquivo. */
    suspend fun scanRaw(): RawScan

    /** Se a plataforma tem acesso para limpeza profunda fora das pastas de mídia. */
    fun hasDeepCleanAccess(): Boolean

    /**
     * Apaga arquivos de sujeira JÁ REVISADOS E APROVADOS pelo usuário.
     * Nunca chamar sem confirmação explícita. Retorna (quantidade, bytes).
     */
    fun deleteJunk(files: List<JunkFile>): Pair<Int, Long>
}

/**
 * Scanner de atalhos da tela inicial.
 * Android: usa LauncherApps + ShortcutManager.
 * iOS: retorna lista vazia (API não disponível).
 */
expect class LauncherScanner(context: PlatformContext) {
    /**
     * Encontra grupos de atalhos/ícones duplicados do mesmo app.
     * Nunca remove nada — apenas detecta.
     */
    fun findDuplicateShortcuts(): List<DuplicateShortcutGroup>

    /**
     * Desabilita pinned shortcuts de um pacote via ShortcutManager.
     * Só funciona para shortcuts que o próprio app publicou — para shortcuts
     * de terceiros, apenas os listamos e guiamos o usuário manualmente.
     */
    fun disablePinnedShortcuts(packageName: String, shortcutIds: List<String>)
}

/** Abre o conteúdo de um arquivo para leitura em streaming (upload/hash). */
expect fun openFileSource(context: PlatformContext, ref: br.com.appstom.model.FileRef): Source?

/** Retorna o tempo atual em milissegundos (epoch). Usado para calcular "há quanto tempo" nos arquivos. */
expect fun nowMs(): Long

/** Formata um timestamp em "Mês de YYYY" em português (ex: "Agosto de 2026"). */
expect fun formatMonthYear(ms: Long): String
