package br.com.limpezastom.logic

import br.com.limpezastom.model.DuplicateShortcutGroup
import br.com.limpezastom.model.LayeredSuggestions
import br.com.limpezastom.model.RawScan
import br.com.limpezastom.model.StorageScore

/**
 * Calcula a pontuação "modo fábrica" (0–100) que indica quão próximo
 * o dispositivo está do desempenho original de fábrica.
 *
 * Pesos:
 *  - 35% espaço livre no armazenamento
 *  - 25% lixo acumulado vs. total
 *  - 20% duplicatas detectadas (penalidade por duplicata)
 *  - 20% atalhos duplicados na tela (penalidade por ícone extra)
 */
class ScoreCalculator {

    fun compute(
        raw: RawScan,
        suggestions: LayeredSuggestions,
        shortcuts: List<DuplicateShortcutGroup>,
        duplicateCount: Int,
    ): StorageScore {
        val total = raw.totalStorageBytes.coerceAtLeast(1L)
        val free  = raw.freeStorageBytes

        // Espaço livre (0–100). Abaixo de 15% livre, aplica penalidade extra.
        val spacePct = (free.toDouble() / total * 100.0).coerceIn(0.0, 100.0)
        val spaceScore = if (spacePct < 15.0) spacePct * 0.7 else spacePct

        // Lixo vs. total
        val junkBytes = suggestions.totalBytes
        val junkRatio = junkBytes.toDouble() / total
        val junkScore = ((1.0 - junkRatio) * 100.0).coerceIn(0.0, 100.0)

        // Duplicatas: cada duplicata retira 0,5 ponto, máximo -20
        val dupPenalty = (duplicateCount * 0.5).coerceAtMost(20.0)

        // Atalhos extras: cada ícone duplicado retira 1 ponto, máximo -20
        val shortcutExtras = shortcuts.sumOf { it.extras }
        val shortcutPenalty = (shortcutExtras * 1.0).coerceAtMost(20.0)

        val current = (spaceScore * 0.35
                + junkScore * 0.25
                + (100.0 - dupPenalty) * 0.20
                + (100.0 - shortcutPenalty) * 0.20)
            .coerceIn(0.0, 100.0)
            .toInt()

        // Pontuação projetada: assume que toda a sujeira e metade das duplicatas
        // serão removidas. Dá ao usuário motivação realista sem prometer 100%.
        val projectedFreeBytes = free + junkBytes + (suggestions.bytesL2 / 2)
        val projectedSpacePct = (projectedFreeBytes.toDouble() / total * 100.0).coerceIn(0.0, 100.0)
        val projectedSpaceScore = if (projectedSpacePct < 15.0) projectedSpacePct * 0.7 else projectedSpacePct
        val projectedDupPenalty = (duplicateCount / 2 * 0.5).coerceAtMost(20.0)
        val projectedShortcutPenalty = 0.0 // assume atalhos removidos

        val projected = (projectedSpaceScore * 0.35
                + 95.0 * 0.25   // assume lixo removido
                + (100.0 - projectedDupPenalty) * 0.20
                + (100.0 - projectedShortcutPenalty) * 0.20)
            .coerceIn(current.toDouble(), 100.0)
            .toInt()

        return StorageScore(
            current = current,
            projected = projected,
            freeBytes = free,
            totalBytes = total,
            junkBytes = junkBytes,
            duplicateCount = duplicateCount,
            shortcutExtras = shortcutExtras,
        )
    }
}
