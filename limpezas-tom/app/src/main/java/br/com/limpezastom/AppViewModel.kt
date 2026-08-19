package br.com.limpezastom

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import br.com.limpezastom.cloud.DriveUploader
import br.com.limpezastom.cloud.PhotosUploader
import br.com.limpezastom.model.BackupProgress
import br.com.limpezastom.model.BackupSummary
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.ScanReport
import br.com.limpezastom.model.UiState
import br.com.limpezastom.scan.DeviceScanner
import br.com.limpezastom.ui.formatBytes
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

/**
 * Regra de ouro do Limpezas Tom: o app NUNCA apaga nada sozinho.
 * Toda exclusão passa por revisão e confirmação explícita do usuário —
 * a sujeira pela tela de revisão, e as mídias já salvas na nuvem pelo
 * diálogo de confirmação do próprio Android.
 */
class AppViewModel(app: Application) : AndroidViewModel(app) {

    private val scanner = DeviceScanner(app)
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(300, TimeUnit.SECONDS)
        .build()
    private val photosUploader = PhotosUploader(app, httpClient)
    private val driveUploader = DriveUploader(app, httpClient)

    private val _state = MutableStateFlow<UiState>(UiState.Idle)
    val state: StateFlow<UiState> = _state

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message

    private var lastReport: ScanReport? = null

    fun hasAllFilesAccess(): Boolean = scanner.hasAllFilesAccess()

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
        viewModelScope.launch(Dispatchers.IO) {
            val report = scanner.fullScan()
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

        viewModelScope.launch(Dispatchers.IO) {
            val duplicateUris = report.duplicates.map { it.uri }.toSet()
            val toUpload = report.media.filter { it.uri !in duplicateUris }

            var photosSent = 0
            var photosFailed = 0
            val deletable = mutableListOf<Uri>()
            var deletableBytes = 0L

            toUpload.forEachIndexed { index, item ->
                _state.value = UiState.Working(
                    BackupProgress("Enviando fotos e vídeos ao Google Fotos", index, toUpload.size, item.name)
                )
                if (photosUploader.upload(accessToken, item)) {
                    photosSent++
                    deletable += item.uri
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
                if (driveUploader.upload(accessToken, doc)) {
                    docsSent++
                    deletable += doc.uri
                    deletableBytes += doc.size
                } else {
                    docsFailed++
                }
            }

            // Duplicatas: o conteúdo já está na nuvem via original — o usuário
            // decide se apaga as cópias (nada é apagado sem confirmação).
            report.duplicates.forEach {
                deletable += it.uri
                deletableBytes += it.size
            }

            _state.value = UiState.Done(
                BackupSummary(
                    photosSent = photosSent,
                    photosFailed = photosFailed,
                    docsSent = docsSent,
                    docsFailed = docsFailed,
                    deletableUris = deletable,
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
        viewModelScope.launch(Dispatchers.IO) {
            _state.value = UiState.Working(BackupProgress("Removendo a sujeira aprovada", 0, approved.size))
            val (count, bytes) = scanner.deleteJunk(approved)
            notify("Sujeira removida: $count arquivos · ${formatBytes(bytes)} liberados.")
            // Re-analisa para atualizar os números
            val fresh = scanner.fullScan()
            lastReport = fresh
            _state.value = UiState.Results(fresh)
        }
    }

    // ── Pós-backup ────────────────────────────────────────────────────

    /** Chamado quando o usuário confirmou, no diálogo do Android, a exclusão dos itens já salvos. */
    fun onDeviceCleanupDone() {
        notify("Itens salvos na nuvem foram removidos do celular. 🎉")
        reset()
    }

    fun reset() {
        lastReport = null
        _state.value = UiState.Idle
    }
}
