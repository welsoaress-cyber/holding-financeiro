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
)

/** Arquivo considerado sujeira, com o motivo da classificação. */
data class JunkFile(
    val file: File,
    val size: Long,
    val reason: String,
)

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
}

/** Progresso da fase atual do backup/limpeza. */
data class BackupProgress(
    val phase: String,
    val done: Int,
    val total: Int,
    val currentFile: String = "",
)

/** Resumo final após backup e limpeza. */
data class BackupSummary(
    val photosSent: Int = 0,
    val photosFailed: Int = 0,
    val docsSent: Int = 0,
    val docsFailed: Int = 0,
    val junkDeleted: Int = 0,
    val junkBytesFreed: Long = 0,
    /** Itens já salvos na nuvem que podem ser apagados do celular. */
    val deletableUris: List<Uri> = emptyList(),
    val deletableBytes: Long = 0,
)

sealed interface UiState {
    data object Idle : UiState
    data object Scanning : UiState
    data class Results(val report: ScanReport) : UiState
    data class Working(val progress: BackupProgress) : UiState
    data class Done(val summary: BackupSummary) : UiState
}
