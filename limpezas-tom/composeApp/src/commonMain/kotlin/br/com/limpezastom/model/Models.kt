package br.com.limpezastom.model

// ── Enums ─────────────────────────────────────────────────────────────────────

enum class FileKind { PHOTO, VIDEO, DOCUMENT, AUDIO, JUNK, UNKNOWN }

enum class SuggestionLayer {
    /** Lixo óbvio — cache, temp, APKs, .DS_Store. Aprovação em lote. */
    L1_OBVIOUS,
    /** Lixo com critério — fotos borradas, screenshots velhos, áudios não reproduzidos. */
    L2_CRITERIA,
    /** Lixo com cautela — arquivos pessoais antigos e não acessados. */
    L3_CAUTIOUS,
}

enum class SuggestionType {
    JUNK_CACHE, JUNK_TEMP, JUNK_APK, JUNK_MACOS_ARTIFACT,
    DUPLICATE_EXACT, DUPLICATE_SIMILAR,
    BLURRY_PHOTO, OLD_SCREENSHOT, UNPLAYED_AUDIO, SHORT_VIDEO,
    OLD_UNACCESSED_DOC, OLD_WHATSAPP_MEDIA,
    SHORTCUT_DUPLICATE,
}

enum class TrustMode {
    /** 0–2 limpezas: mais validações, revisão item a item. */
    FIRST_CLEAN,
    /** 3–9 limpezas: fluxo equilibrado, revisão por lote na L1. */
    ESTABLISHED,
    /** 10+ limpezas: fluxo rápido, aprovação por camada em 1 toque. */
    EXPERT,
}

// ── Referência de arquivo ──────────────────────────────────────────────────────

/**
 * Referência a um arquivo do aparelho, neutra de plataforma.
 * Android: id = content:// URI. iOS: id = "phasset:<localIdentifier>"
 * para mídia da galeria, ou um caminho de arquivo.
 *
 * Campos opcionais são preenchidos pelo scanner quando disponíveis.
 * O motor de sugestões usa esses campos para classificar sem re-acessar o disco.
 */
data class FileRef(
    val id: String,
    val name: String,
    val size: Long,
    val mime: String,
    val kind: FileKind,
    /** Última modificação em ms (epoch). 0 = desconhecida. */
    val lastModifiedMs: Long = 0,
    /** Arquivo está em diretório marcado com .nomedia — nunca sugerir exclusão. */
    val isNomedia: Boolean = false,
    /** Arquivo é screenshot (detectado pelo path ou metadados EXIF). */
    val isScreenshot: Boolean = false,
    /** Score de nitidez da foto (0–100). null = não calculado. */
    val blurScore: Int? = null,
    /** Áudio já foi reproduzido pelo sistema ao menos uma vez. */
    val wasPlayed: Boolean = false,
    /** Duração em ms para vídeos e áudios. null = desconhecida. */
    val durationMs: Long? = null,
)

// ── Junk (lixo detectado pelo scanner de plataforma) ──────────────────────────

/** Arquivo considerado sujeira pelo scanner, com o motivo da classificação. */
data class JunkFile(
    val path: String,
    val size: Long,
    val reason: String,
)

/** Grupo de sujeira por motivo, para a tela de revisão. */
data class JunkGroup(
    val reason: String,
    val files: List<JunkFile>,
) {
    val bytes: Long get() = files.sumOf { it.size }
}

// ── Varredura bruta ────────────────────────────────────────────────────────────

/**
 * Resultado bruto da varredura de plataforma.
 * Os duplicados são calculados na lógica comum (DuplicateFinder).
 * As estatísticas de armazenamento alimentam o ScoreCalculator.
 */
data class RawScan(
    val media: List<FileRef> = emptyList(),
    val documents: List<FileRef> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
    /** Espaço total do armazenamento interno em bytes. 0 = indisponível. */
    val totalStorageBytes: Long = 0,
    /** Espaço livre do armazenamento interno em bytes. 0 = indisponível. */
    val freeStorageBytes: Long = 0,
    /** Contagem de duplicatas detectadas (preenchida pela lógica comum, não pelo scanner). */
    val duplicateCount: Int = 0,
)

/** Resultado completo de uma análise do aparelho. */
data class ScanReport(
    val media: List<FileRef> = emptyList(),
    val documents: List<FileRef> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
    val duplicates: List<FileRef> = emptyList(),
    val suggestions: LayeredSuggestions = LayeredSuggestions(),
    val shortcuts: List<DuplicateShortcutGroup> = emptyList(),
    val score: StorageScore = StorageScore(),
) {
    val mediaBytes: Long get() = media.sumOf { it.size }
    val documentBytes: Long get() = documents.sumOf { it.size }
    val junkBytes: Long get() = junk.sumOf { it.size }
    val duplicateBytes: Long get() = duplicates.sumOf { it.size }
    val photosCount: Int get() = media.count { it.kind == FileKind.PHOTO }
    val videosCount: Int get() = media.count { it.kind == FileKind.VIDEO }
    val totalReclaimableBytes: Long
        get() = suggestions.totalBytes + duplicateBytes

    fun junkGroups(): List<JunkGroup> =
        junk.groupBy { it.reason }
            .map { (reason, files) -> JunkGroup(reason, files.sortedByDescending { it.size }) }
            .sortedByDescending { it.bytes }
}

// ── Sugestões em camadas ───────────────────────────────────────────────────────

/**
 * Sugestão individual gerada pelo SuggestionEngine.
 * Nunca executa ação — só descreve o que PODE ser feito.
 */
data class Suggestion(
    val id: String,
    val file: FileRef,
    val layer: SuggestionLayer,
    val type: SuggestionType,
    /** Razão legível pelo usuário (ex: "Screenshot com 45 dias sem visualização"). */
    val reason: String,
    /** ID do grupo de duplicatas, se aplicável. */
    val groupId: String? = null,
)

/** Sugestões classificadas nas 3 camadas com estimativas de espaço. */
data class LayeredSuggestions(
    val layer1: List<Suggestion> = emptyList(),
    val layer2: List<Suggestion> = emptyList(),
    val layer3: List<Suggestion> = emptyList(),
) {
    val bytesL1: Long get() = layer1.sumOf { it.file.size }
    val bytesL2: Long get() = layer2.sumOf { it.file.size }
    val bytesL3: Long get() = layer3.sumOf { it.file.size }
    val totalBytes: Long get() = bytesL1 + bytesL2 + bytesL3
    val totalCount: Int get() = layer1.size + layer2.size + layer3.size
}

// ── Atalhos duplicados ─────────────────────────────────────────────────────────

/** Grupo de atalhos/ícones duplicados do mesmo app na tela inicial. */
data class DuplicateShortcutGroup(
    val packageName: String,
    val appLabel: String,
    /** URI do ícone (android.resource:// ou content://). Pode ser vazio. */
    val appIconUri: String,
    /** Número de Activities com intent LAUNCHER para este pacote. */
    val activityCount: Int,
    /** IDs de pinned shortcuts que podem ser desabilitados via ShortcutManager. */
    val pinnedShortcutIds: List<String>,
    /** Total de ícones extras (além do principal). */
    val extras: Int,
)

// ── Pontuação de desempenho ────────────────────────────────────────────────────

/**
 * Pontuação "modo fábrica" (0–100).
 * current = estado agora. projected = estimativa após limpeza aprovada.
 */
data class StorageScore(
    val current: Int = 0,
    val projected: Int = 0,
    val freeBytes: Long = 0,
    val totalBytes: Long = 0,
    val junkBytes: Long = 0,
    val duplicateCount: Int = 0,
    val shortcutExtras: Int = 0,
) {
    val freeBytesAfterClean: Long get() = freeBytes + junkBytes

    fun label(): String = when {
        current >= 90 -> "Excelente"
        current >= 75 -> "Bom"
        current >= 60 -> "Regular"
        else          -> "Atenção"
    }
}

// ── Perfil de confiança ────────────────────────────────────────────────────────

data class TrustProfile(
    val totalCleans: Int = 0,
    val totalFilesDeleted: Int = 0,
    val totalBytesFreed: Long = 0L,
    val complaintsFiled: Int = 0,
    val mode: TrustMode = TrustMode.FIRST_CLEAN,
) {
    /** Percentual de limpezas sem arrependimento (0–100). */
    val safetyIndex: Int
        get() = if (totalFilesDeleted == 0) 100
                else ((1.0 - complaintsFiled.toDouble() / totalFilesDeleted) * 100)
                    .toInt().coerceIn(0, 100)
}

// ── Progresso e resumo ─────────────────────────────────────────────────────────

/** Progresso genérico de operações longas (limpeza, varredura). */
data class WorkProgress(
    val phase: String,
    val done: Int,
    val total: Int,
    val currentFile: String = "",
)

// ── Estado de UI ───────────────────────────────────────────────────────────────

sealed interface UiState {
    data object Idle : UiState
    data object Scanning : UiState
    data class Results(val report: ScanReport) : UiState

    /** Revisão da sujeira: o usuário vê e escolhe o que apagar antes de qualquer exclusão. */
    data class JunkReview(val groups: List<JunkGroup>) : UiState

    /** Revisão de uma camada específica de sugestões. */
    data class LayerReview(
        val layer: SuggestionLayer,
        val suggestions: List<Suggestion>,
        val report: ScanReport,
    ) : UiState

    /** Revisão de atalhos duplicados. */
    data class ShortcutsReview(val groups: List<DuplicateShortcutGroup>) : UiState

    data class Working(val progress: WorkProgress) : UiState
}
