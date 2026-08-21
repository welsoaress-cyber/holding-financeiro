package br.com.limpezastom.model

// ── Enums usados pelo scanner de plataforma ────────────────────────────────────

enum class FileKind { PHOTO, VIDEO, DOCUMENT, AUDIO, JUNK, UNKNOWN }

// ── Referência de arquivo ──────────────────────────────────────────────────────

/**
 * Referência a um arquivo do aparelho, neutra de plataforma.
 * Android: [id] = content:// URI. iOS: [id] = caminho de arquivo.
 */
data class FileRef(
    val id: String,
    val name: String,
    val size: Long,
    val mime: String,
    val kind: FileKind,
    val lastModifiedMs: Long = 0,
    val isScreenshot: Boolean = false,
    /** Duração em ms para vídeos e áudios. null = desconhecida. */
    val durationMs: Long? = null,
    /** Arquivo está em diretório marcado com .nomedia — não sugerir exclusão. */
    val isNomedia: Boolean = false,
    /** Áudio já foi reproduzido ao menos uma vez. */
    val wasPlayed: Boolean = false,
)

// ── Tipos usados internamente pelo DeviceScanner ──────────────────────────────

data class JunkFile(
    val path: String,
    val size: Long,
    val reason: String,
)

data class RawScan(
    val media: List<FileRef> = emptyList(),
    val documents: List<FileRef> = emptyList(),
    val junk: List<JunkFile> = emptyList(),
    val totalStorageBytes: Long = 0,
    val freeStorageBytes: Long = 0,
    val duplicateCount: Int = 0,
)

/** Grupo de atalhos/ícones duplicados do mesmo app (usado pelo LauncherScanner). */
data class DuplicateShortcutGroup(
    val packageName: String,
    val appLabel: String,
    val appIconUri: String,
    val activityCount: Int,
    /** Rótulo de cada atividade launcher do app (ex: ["iFood", "iFood Express"]). */
    val activityLabels: List<String> = emptyList(),
    val pinnedShortcutIds: List<String>,
    val extras: Int,
)

// ── Estado de UI — fluxo de backup de screenshots ─────────────────────────────

sealed interface UiState {

    /** Tela inicial: nenhuma ação em andamento. */
    data object Idle : UiState

    /** Varrendo screenshots no aparelho. */
    data object Scanning : UiState

    /**
     * Screenshots encontrados e prontos para revisão.
     * [sinkReady] = o usuário já escolheu uma pasta de destino.
     */
    data class Found(
        val screenshots: List<FileRef>,
        val sinkReady: Boolean,
    ) : UiState

    /** Enviando arquivos para a pasta de backup. */
    data class Uploading(
        val done: Int,
        val total: Int,
        val currentName: String = "",
    ) : UiState

    /** Backup concluído com sucesso. */
    data class Done(
        val count: Int,
        val folderName: String,
        /** Arquivos que foram enviados — usados para oferecer exclusão do celular. */
        val backedUpFiles: List<FileRef> = emptyList(),
    ) : UiState

    // ── Fluxo: limpeza de atalhos duplicados ──────────────────────────────────

    /** Varrendo atalhos duplicados na tela inicial. */
    data object ScanningShortcuts : UiState

    /**
     * Atalhos duplicados encontrados.
     * [groups] pode ser vazio se não houver duplicatas.
     */
    data class FoundShortcuts(val groups: List<DuplicateShortcutGroup>) : UiState
}
