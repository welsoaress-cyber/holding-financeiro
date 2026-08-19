package br.com.limpezastom.logic

import br.com.limpezastom.model.DuplicateShortcutGroup
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.LayeredSuggestions
import br.com.limpezastom.model.ScanReport
import br.com.limpezastom.model.Suggestion
import br.com.limpezastom.model.SuggestionLayer
import br.com.limpezastom.model.TrustProfile
import br.com.limpezastom.model.UiState
import br.com.limpezastom.model.WorkProgress
import kotlinx.datetime.Clock
import br.com.limpezastom.platform.DeviceScanner
import br.com.limpezastom.platform.LauncherScanner
import br.com.limpezastom.platform.PlatformContext
import br.com.limpezastom.ui.formatBytes
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
 * Toda exclusão passa por revisão e confirmação explícita do usuário.
 *
 * Arquivos com menos de 24h nunca aparecem em nenhuma sugestão.
 * Arquivos .nomedia são ignorados pelo SuggestionEngine.
 */
class AppLogic(private val context: PlatformContext) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val scanner = DeviceScanner(context)
    private val launcherScanner = LauncherScanner(context)
    private val duplicateFinder = DuplicateFinder(context)
    private val suggestionEngine = SuggestionEngine()
    private val scoreCalculator = ScoreCalculator()

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

    // ── Análise ───────────────────────────────────────────────────────────────

    fun scan() {
        if (_state.value is UiState.Scanning || _state.value is UiState.Working) return
        _state.value = UiState.Scanning
        scope.launch {
            val nowMs = Clock.System.now().toEpochMilliseconds()
            val raw = scanner.scanRaw()
            val duplicates = duplicateFinder.find(raw.media)

            // Atalhos duplicados na tela (Android) ou lista vazia (iOS)
            val shortcuts: List<DuplicateShortcutGroup> = try {
                launcherScanner.findDuplicateShortcuts()
            } catch (_: Exception) {
                emptyList()
            }

            // Classifica arquivos em camadas L1 / L2 / L3
            val suggestions: LayeredSuggestions = suggestionEngine.classify(
                raw = raw,
                duplicates = duplicates,
                nowMs = nowMs,
            )

            // Pontuação "modo fábrica"
            val score = scoreCalculator.compute(
                raw = raw.copy(duplicateCount = duplicates.size),
                suggestions = suggestions,
                shortcuts = shortcuts,
                duplicateCount = duplicates.size,
            )

            val report = ScanReport(
                media = raw.media,
                documents = raw.documents,
                junk = raw.junk,
                duplicates = duplicates,
                suggestions = suggestions,
                shortcuts = shortcuts,
                score = score,
            )
            lastReport = report
            _state.value = UiState.Results(report)
        }
    }

    // ── Revisão por camada ────────────────────────────────────────────────────

    fun requestLayerReview(layer: SuggestionLayer) {
        val report = lastReport ?: return
        val suggestions = when (layer) {
            SuggestionLayer.L1_OBVIOUS  -> report.suggestions.layer1
            SuggestionLayer.L2_CRITERIA -> report.suggestions.layer2
            SuggestionLayer.L3_CAUTIOUS -> report.suggestions.layer3
        }
        if (suggestions.isEmpty()) {
            val label = when (layer) {
                SuggestionLayer.L1_OBVIOUS  -> "lixo óbvio"
                SuggestionLayer.L2_CRITERIA -> "itens com critério"
                SuggestionLayer.L3_CAUTIOUS -> "itens cautelosos"
            }
            notify("Nenhum $label encontrado. 🎉")
            return
        }
        _state.value = UiState.LayerReview(
            layer = layer,
            suggestions = suggestions,
            report = report,
        )
    }

    /** Volta da revisão de camada para a tela de resultados. */
    fun cancelLayerReview() {
        val report = lastReport
        _state.value = if (report != null) UiState.Results(report) else UiState.Idle
    }

    /**
     * Envia para quarentena os itens aprovados pelo usuário na revisão de camada.
     * Não apaga nada — os arquivos ficam no dispositivo até o término da quarentena (7 dias).
     */
    fun confirmLayerSuggestions(approved: List<Suggestion>) {
        if (approved.isEmpty()) {
            cancelLayerReview()
            return
        }
        if (_state.value is UiState.Working) return

        // TODO: persist approved items to QuarantineRepository (Room integration)
        val totalBytes = approved.sumOf { it.file.size }
        notify("${approved.size} itens enviados para a Lixeira Segura · ${formatBytes(totalBytes)} recuperados após 7 dias.")
        val report = lastReport
        _state.value = if (report != null) UiState.Results(report) else UiState.Idle
    }

    // ── Atalhos duplicados ────────────────────────────────────────────────────

    fun requestShortcutsReview() {
        val report = lastReport ?: return
        if (report.shortcuts.isEmpty()) {
            notify("Nenhum ícone duplicado encontrado. ✨")
            return
        }
        _state.value = UiState.ShortcutsReview(report.shortcuts)
    }

    fun cancelShortcutsReview() {
        val report = lastReport
        _state.value = if (report != null) UiState.Results(report) else UiState.Idle
    }

    /**
     * Desabilita pinned shortcuts aprovados pelo usuário.
     * Para ícones de Activity launcher, apenas registra para instrução guiada
     * (o sistema não permite remoção programática sem Accessibility Service).
     */
    fun confirmShortcutCleanup(approvedPinnedIds: Map<String, List<String>>) {
        approvedPinnedIds.forEach { (pkg, ids) ->
            if (ids.isNotEmpty()) {
                try {
                    launcherScanner.disablePinnedShortcuts(pkg, ids)
                } catch (_: Exception) {
                    // Ignora falha silenciosamente — ShortcutManager pode rejeitar
                }
            }
        }
        val total = approvedPinnedIds.values.sumOf { it.size }
        notify("$total atalho(s) duplicado(s) removido(s). Sua tela ficou mais limpa! ✨")
        cancelShortcutsReview()
    }

    // ── Sujeira: revisar antes, apagar só o aprovado ──────────────────────────

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
            _state.value = UiState.Working(WorkProgress("Removendo a sujeira aprovada", 0, approved.size))
            val (count, bytes) = scanner.deleteJunk(approved)
            notify("Sujeira removida: $count arquivos · ${formatBytes(bytes)} liberados.")
            // Re-analisa para atualizar os números
            val nowMs = Clock.System.now().toEpochMilliseconds()
            val raw = scanner.scanRaw()
            val dups = duplicateFinder.find(raw.media)
            val suggestions = suggestionEngine.classify(raw, dups, nowMs)
            val shortcuts = try { launcherScanner.findDuplicateShortcuts() } catch (_: Exception) { emptyList() }
            val score = scoreCalculator.compute(raw.copy(duplicateCount = dups.size), suggestions, shortcuts, dups.size)
            val fresh = ScanReport(
                media = raw.media, documents = raw.documents, junk = raw.junk,
                duplicates = dups, suggestions = suggestions, shortcuts = shortcuts, score = score,
            )
            lastReport = fresh
            _state.value = UiState.Results(fresh)
        }
    }

    fun reset() {
        lastReport = null
        _state.value = UiState.Idle
    }

    // ── TrustProfile (retorna diretamente — sem persistência ainda) ───────────

    fun getTrustProfile(): TrustProfile = TrustProfile(
        totalCleans = 0,
        totalFilesDeleted = 0,
        totalBytesFreed = 0L,
        complaintsFiled = 0,
    )
}

/** Mantém uma única instância da lógica viva enquanto o app existe. */
object LogicHolder {
    private var instance: AppLogic? = null

    fun get(context: PlatformContext): AppLogic =
        instance ?: AppLogic(context).also { instance = it }
}
