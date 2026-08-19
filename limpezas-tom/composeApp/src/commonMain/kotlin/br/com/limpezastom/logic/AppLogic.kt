package br.com.limpezastom.logic

import br.com.limpezastom.cloud.GoogleDriveApi
import br.com.limpezastom.cloud.GooglePhotosApi
import br.com.limpezastom.model.BackupProgress
import br.com.limpezastom.model.BackupSummary
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.ScanReport
import br.com.limpezastom.model.UiState
import br.com.limpezastom.platform.DeviceScanner
import br.com.limpezastom.platform.PlatformContext
import br.com.limpezastom.ui.formatBytes
import io.ktor.client.HttpClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Lógica compartilhada entre Android e iOS.
 *
 * Regra de ouro do Limpezas Tom: o app NUNCA apaga nada sozinho.
 * Toda exclusão passa por revisão e confirmação explícita do usuário —
 * a sujeira pela tela de revisão, e as mídias já salvas na nuvem pelo
 * diálogo de confirmação do próprio sistema (Android ou iOS).
 */
class AppLogic(private val context: PlatformContext) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val scanner = DeviceScanner(context)
    private val duplicateFinder = DuplicateFinder(context)
    private val http = HttpClient()
    private val photosApi = GooglePhotosApi(http, context)
    private val driveApi = GoogleDriveApi(http, context)

    private val _state = MutableStateFlow<UiState>(UiState.Idle)
    val state: StateFlow<UiState> = _state

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message

    /**
     * Indica se a plataforma tem acesso para limpeza profunda fora das pastas
     * de mídia. Exposto como StateFlow para que a UI reaja quando o usuário
     * concede a permissão nas configurações e volta para o app.
     */
    private val _deepCleanAccess = MutableStateFlow(scanner.hasDeepCleanAccess())
    val deepCleanAccess: StateFlow<Boolean> = _deepCleanAccess.asStateFlow()

    private var lastReport: ScanReport? = null

    fun hasDeepCleanAccess(): Boolean = _deepCleanAccess.value

    /**
     * Chamado pelo Android em onResume() — reavalia se o acesso total a
     * arquivos foi concedido enquanto o app estava em segundo plano.
     */
    fun refreshDeepCleanStatus() {
        _deepCleanAccess.value = scanner.hasDeepCleanAccess()
    }

    fun clearMessage() {
        _message.value = null
    }

    fun notify(text: String) {
        _message.value = text
    }

    // ── Análise ───────────────────────────────────────────────────────

    fun scan() {
        if (_state.value is UiState.Scanning || _state.value is UiState.Working) return
        _state.value = UiState.Scanning
        scope.launch {
            val raw = scanner.scanRaw()
            val report = ScanReport(
                media = raw.media,
                documents = raw.documents,
                junk = raw.junk,
                duplicates = duplicateFinder.find(raw.media),
            )
            lastReport = report
            _state.value = UiState.Results(report)
        }
    }

    // ── Backup (só envia — não apaga nada) ────────────────────────────

    /**
     * Envia fotos/vídeos ao Google Fotos e documentos ao Drive.
     * Duplicatas não são reenviadas (o original já vai), mas entram na
     * lista de itens que o usuário PODE apagar depois, se confirmar.
     */
    fun startBackup(accessToken: String) {
        val report = lastReport ?: run {
            notify("Faça a análise do celular primeiro.")
            return
        }
        if (_state.value is UiState.Working) return

        scope.launch {
            val duplicateIds = report.duplicates.map { it.id }.toSet()
            val toUpload = report.media.filter { it.id !in duplicateIds }

            var photosSent = 0
            var photosFailed = 0
            val deletable = mutableListOf<FileRef>()
            var deletableBytes = 0L

            toUpload.forEachIndexed { index, item ->
                _state.value = UiState.Working(
                    BackupProgress("Enviando fotos e vídeos ao Google Fotos", index, toUpload.size, item.name)
                )
                if (photosApi.upload(accessToken, item)) {
                    photosSent++
                    deletable += item
                    deletableBytes += item.size
                } else {
                    photosFailed++
                }
            }

            var docsSent = 0
            var docsFailed = 0
            report.documents.forEachIndexed { index, doc ->
                _state.value = UiState.Working(
                    BackupProgress("Organizando documentos no Google Drive", index, report.documents.size, doc.name)
                )
                if (driveApi.upload(accessToken, doc)) {
                    docsSent++
                    deletable += doc
                    deletableBytes += doc.size
                } else {
                    docsFailed++
                }
            }

            // Duplicatas: o conteúdo já está na nuvem via original — o usuário
            // decide se apaga as cópias (nada é apagado sem confirmação).
            report.duplicates.forEach {
                deletable += it
                deletableBytes += it.size
            }

            _state.value = UiState.Done(
                BackupSummary(
                    photosSent = photosSent,
                    photosFailed = photosFailed,
                    docsSent = docsSent,
                    docsFailed = docsFailed,
                    deletable = deletable,
                    deletableBytes = deletableBytes,
                )
            )
        }
    }

    // ── Sujeira: revisar antes, apagar só o aprovado ──────────────────

    fun requestJunkReview() {
        val report = lastReport ?: return
        if (report.junk.isEmpty()) {
            notify("Nenhuma sujeira encontrada. 🎉")
            return
        }
        _state.value = UiState.JunkReview(report.junkGroups())
    }

    fun cancelJunkReview() {
        val report = lastReport
        _state.value = if (report != null) UiState.Results(report) else UiState.Idle
    }

    /** Apaga somente os arquivos que o usuário marcou e confirmou na revisão. */
    fun confirmJunkCleanup(approved: List<JunkFile>) {
        if (approved.isEmpty()) {
            cancelJunkReview()
            return
        }
        if (_state.value is UiState.Working) return
        scope.launch {
            _state.value = UiState.Working(BackupProgress("Removendo a sujeira aprovada", 0, approved.size))
            val (count, bytes) = scanner.deleteJunk(approved)
            notify("Sujeira removida: $count arquivos · ${formatBytes(bytes)} liberados.")
            // Re-analisa para atualizar os números
            val raw = scanner.scanRaw()
            val fresh = ScanReport(
                media = raw.media,
                documents = raw.documents,
                junk = raw.junk,
                duplicates = duplicateFinder.find(raw.media),
            )
            lastReport = fresh
            _state.value = UiState.Results(fresh)
        }
    }

    // ── Pós-backup ────────────────────────────────────────────────────

    /** Chamado quando o usuário confirmou, no diálogo do sistema, a exclusão dos itens já salvos. */
    fun onDeviceCleanupDone() {
        notify("Itens salvos na nuvem foram removidos do celular. 🎉")
        reset()
    }

    fun reset() {
        lastReport = null
        _state.value = UiState.Idle
    }
}

/** Mantém uma única instância da lógica viva enquanto o app existe. */
object LogicHolder {
    private var instance: AppLogic? = null

    fun get(context: PlatformContext): AppLogic =
        instance ?: AppLogic(context).also { instance = it }
}
