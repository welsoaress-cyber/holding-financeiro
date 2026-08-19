package br.com.limpezastom.logic

import br.com.limpezastom.model.TrustMode
import br.com.limpezastom.model.TrustProfile

/**
 * Gerencia o perfil de confiança do app — quantidade de limpezas,
 * histórico de segurança e modo de interação (primeira limpeza vs. experiente).
 *
 * Armazenado em SharedPreferences no Android (chaves simples) para não
 * depender do Room enquanto o módulo de persistência está sendo construído.
 * Migrar para TrustHistoryDao quando Room estiver integrado.
 */
class TrustManager(private val store: TrustStore) {

    fun getProfile(): TrustProfile {
        val total = store.totalCleans
        val mode = when {
            total >= 10 -> TrustMode.EXPERT
            total >= 3  -> TrustMode.ESTABLISHED
            else        -> TrustMode.FIRST_CLEAN
        }
        return TrustProfile(
            totalCleans       = total,
            totalFilesDeleted = store.totalFilesDeleted,
            totalBytesFreed   = store.totalBytesFreed,
            complaintsFiled   = store.complaintsFiled,
            mode              = mode,
        )
    }

    /** Registra uma limpeza concluída com sucesso. */
    fun recordClean(filesDeleted: Int, bytesFreed: Long) {
        store.totalCleans++
        store.totalFilesDeleted += filesDeleted
        store.totalBytesFreed += bytesFreed
    }

    /**
     * Registra que o usuário usou o Undo para recuperar um arquivo
     * que havia aprovado para exclusão — indica potencial engano.
     */
    fun recordUndo() {
        store.complaintsFiled++
    }

    /** Resumo textual do histórico para exibir na tela do usuário. */
    fun buildSummaryMessage(profile: TrustProfile): String {
        if (profile.totalCleans == 0) {
            return "Esta é sua primeira limpeza. Vamos devagar e com segurança. ✨"
        }
        val cleanWord = if (profile.totalCleans == 1) "vez" else "vezes"
        val safetyText = if (profile.safetyIndex >= 100) "0 reclamações" else "${profile.complaintsFiled} undo(s)"
        return "Você já limpou este celular ${profile.totalCleans} $cleanWord, " +
               "removendo ${profile.totalFilesDeleted} arquivos. " +
               "Índice de segurança: ${profile.safetyIndex}% — $safetyText."
    }
}

/**
 * Interface simples de persistência do perfil de confiança.
 * Implementação em SharedPreferences no Android, em NSUserDefaults no iOS.
 */
interface TrustStore {
    var totalCleans: Int
    var totalFilesDeleted: Int
    var totalBytesFreed: Long
    var complaintsFiled: Int
}
