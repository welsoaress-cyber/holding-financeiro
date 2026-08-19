package br.com.limpezastom.model

enum class FileKind { PHOTO, VIDEO, DOCUMENT }

/**
 * Referência a um arquivo do aparelho, neutra de plataforma.
 * Android: id = content:// URI. iOS: id = "phasset:<localIdentifier>"
 * para mídia da galeria, ou um caminho de arquivo.
 */
data class FileRef(
    val id: String,
    val name: String,
    val size: Long,
    val mime: String,
    val kind: FileKind,
    /** Última modificação em segundos (epoch). 0 = desconhecida. */
    val modifiedEpochSeconds: Long = 0,
)

/** Arquivo considerado sujeira, com o motivo da classificação. */
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

/** Resultado bruto da varredura da plataforma (sem duplicados — calculados no código comum). */
data class RawScan(
    val media: List<FileRef> = emptyList(),
    val documents: List<FileRef> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
)

/** Resultado completo de uma análise do aparelho. */
data class ScanReport(
    val media: List<FileRef> = emptyList(),
    val documents: List<FileRef> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
    val duplicates: List<FileRef> = emptyList(),
) {
    val mediaBytes: Long get() = media.sumOf { it.size }
    val documentBytes: Long get() = documents.sumOf { it.size }
    val junkBytes: Long get() = junk.sumOf { it.size }
    val duplicateBytes: Long get() = duplicates.sumOf { it.size }
    val photosCount: Int get() = media.count { it.kind == FileKind.PHOTO }
    val videosCount: Int get() = media.count { it.kind == FileKind.VIDEO }

    fun junkGroups(): List<JunkGroup> =
        junk.groupBy { it.reason }
            .map { (reason, files) -> JunkGroup(reason, files.sortedByDescending { it.size }) }
            .sortedByDescending { it.bytes }
}

/** Progresso da fase atual do backup/limpeza. */
data class BackupProgress(
    val phase: String,
    val done: Int,
    val total: Int,
    val currentFile: String = "",
)

/** Resumo final após o backup. Nada foi apagado ainda neste ponto. */
data class BackupSummary(
    val photosSent: Int = 0,
    val photosFailed: Int = 0,
    val docsSent: Int = 0,
    val docsFailed: Int = 0,
    /** Itens já salvos na nuvem que PODEM ser apagados — só com confirmação do usuário. */
    val deletable: List<FileRef> = emptyList(),
    val deletableBytes: Long = 0,
)

sealed interface UiState {
    data object Idle : UiState
    data object Scanning : UiState
    data class Results(val report: ScanReport) : UiState

    /** Revisão da sujeira: o usuário vê e escolhe o que apagar antes de qualquer exclusão. */
    data class JunkReview(val groups: List<JunkGroup>) : UiState

    data class Working(val progress: BackupProgress) : UiState
    data class Done(val summary: BackupSummary) : UiState
}
