package br.com.limpezastom.logic

import br.com.limpezastom.backup.BackupSink
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.UiState
import br.com.limpezastom.platform.DeviceScanner
import br.com.limpezastom.platform.PlatformContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Lógica principal do Limpezas Tom — versão simplificada.
 *
 * Fluxo único por enquanto:
 *   1. scan()        → varre o aparelho e lista screenshots
 *   2. startBackup() → copia os selecionados para a pasta de backup no Drive
 *
 * Nenhum arquivo é excluído automaticamente.
 */
class AppLogic(private val context: PlatformContext) {

    private val scope   = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val scanner = DeviceScanner(context)

    private val _state   = MutableStateFlow<UiState>(UiState.Idle)
    val state: StateFlow<UiState> = _state.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    /** Pasta de destino: definida pela MainActivity quando o usuário escolhe uma pasta. */
    var backupSink: BackupSink? = null

    // ── Scan ──────────────────────────────────────────────────────────────────

    fun scan() {
        if (_state.value is UiState.Scanning) return
        scope.launch {
            _state.value = UiState.Scanning
            val screenshots = runCatching {
                scanner.scanRaw()
                    .media
                    .filter { it.isScreenshot }
                    .sortedByDescending { it.lastModifiedMs }
            }.getOrElse { emptyList() }
            _state.value = UiState.Found(
                screenshots = screenshots,
                sinkReady   = backupSink != null,
            )
        }
    }

    // ── Backup ────────────────────────────────────────────────────────────────

    fun startBackup(selected: List<FileRef>) {
        val sink = backupSink ?: run {
            notify("Escolha uma pasta de destino primeiro.")
            return
        }
        if (selected.isEmpty()) {
            notify("Selecione ao menos um screenshot.")
            return
        }
        if (_state.value is UiState.Uploading) return

        scope.launch {
            _state.value = UiState.Uploading(0, selected.size)
            val folderName = sink.backup(selected) { done, total, name ->
                _state.value = UiState.Uploading(done, total, name)
            }
            _state.value = UiState.Done(selected.size, folderName)
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Chamado pela MainActivity depois que o usuário escolheu uma pasta. */
    fun onSinkReady() {
        val s = _state.value
        if (s is UiState.Found) _state.value = s.copy(sinkReady = true)
    }

    fun reset()              { _state.value = UiState.Idle }
    fun notify(msg: String)  { _message.value = msg }
    fun clearMessage()       { _message.value = null }
}

/** Mantém uma única instância da lógica viva enquanto o processo existir. */
object LogicHolder {
    private var instance: AppLogic? = null

    fun get(context: PlatformContext): AppLogic =
        instance ?: AppLogic(context).also { instance = it }
}
