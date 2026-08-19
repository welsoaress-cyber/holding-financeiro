package br.com.limpezastom.model

import android.net.Uri
import java.io.File

/** Foto ou vídeo encontrado no aparelho. */
data class MediaItemInfo(
    val uri: Uri,
    val name: String,
    val size: Long,
    val mime: String,
    val isVideo: Boolean,
)

/** Documento (PDF, Word, planilha etc.) encontrado no aparelho. */
data class DocumentInfo(
    val uri: Uri,
    val name: String,
    val size: Long,
    val mime: String,
    /** Última modificação, em segundos (epoch). Usado para organizar por ano no Drive. */
    val modifiedEpochSeconds: Long,
)

/** Arquivo considerado sujeira, com o motivo da classificação. */
data class JunkFile(
    val file: File,
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

/** Resultado completo de uma análise do aparelho. */
data class ScanReport(
    val media: List<MediaItemInfo> = emptyList(),
    val documents: List<DocumentInfo> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
    val duplicates: List<MediaItemInfo> = emptyList(),
) {
    val mediaBytes: Long get() = media.sumOf { it.size }
    val documentBytes: Long get() = documents.sumOf { it.size }
    val junkBytes: Long get() = junk.sumOf { it.size }
    val duplicateBytes: Long get() = duplicates.sumOf { it.size }
    val photosCount: Int get() = media.count { !it.isVideo }
    val videosCount: Int get() = media.count { it.isVideo }

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
    val deletableUris: List<Uri> = emptyList(),
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
