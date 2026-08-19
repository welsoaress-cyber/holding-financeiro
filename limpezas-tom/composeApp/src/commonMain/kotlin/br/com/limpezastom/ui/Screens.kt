package br.com.limpezastom.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.model.BackupProgress
import br.com.limpezastom.model.BackupSummary
import br.com.limpezastom.model.DuplicateShortcutGroup
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.JunkGroup
import br.com.limpezastom.model.ScanReport
import br.com.limpezastom.model.StorageScore
import br.com.limpezastom.model.Suggestion
import br.com.limpezastom.model.SuggestionLayer
import br.com.limpezastom.model.UiState
import kotlin.math.roundToInt

@Composable
fun AppRoot(
    logic: AppLogic,
    onScanRequested: () -> Unit,
    onBackupRequested: () -> Unit,
    onDeleteBackedUp: () -> Unit,
    onOpenDeepCleanSettings: () -> Unit,
) {
    MaterialTheme {
        val state by logic.state.collectAsState()
        val message by logic.message.collectAsState()
        val hasDeepClean by logic.deepCleanAccess.collectAsState()
        val snackbar = remember { SnackbarHostState() }

        LaunchedEffect(message) {
            message?.let {
                snackbar.showSnackbar(it)
                logic.clearMessage()
            }
        }

        Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            when (val s = state) {
                // Telas que usam LazyColumn própria (listas longas)
                is UiState.JunkReview -> JunkReviewView(
                    groups = s.groups,
                    modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                    onConfirm = logic::confirmJunkCleanup,
                    onCancel = logic::cancelJunkReview,
                )
                is UiState.LayerReview -> LayerReviewView(
                    layer = s.layer,
                    suggestions = s.suggestions,
                    modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                    onConfirm = logic::confirmLayerSuggestions,
                    onCancel = logic::cancelLayerReview,
                )
                is UiState.ShortcutsReview -> ShortcutsReviewView(
                    groups = s.groups,
                    modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
                    onConfirm = logic::confirmShortcutCleanup,
                    onCancel = logic::cancelShortcutsReview,
                )
                else -> Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 20.dp)
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Spacer(Modifier.height(28.dp))
                    Text("🧹 Limpezas Tom", fontSize = 26.sp, fontWeight = FontWeight.Black)
                    Text(
                        "O celular que parece ter saído da fábrica",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(24.dp))

                    when (s) {
                        is UiState.Idle    -> IdleView(onScanRequested)
                        is UiState.Scanning -> ScanningView()
                        is UiState.Results -> ResultsView(
                            report = s.report,
                            hasDeepClean = hasDeepClean,
                            onBackup = onBackupRequested,
                            onReviewJunk = logic::requestJunkReview,
                            onReviewLayer = logic::requestLayerReview,
                            onReviewShortcuts = logic::requestShortcutsReview,
                            onRescan = onScanRequested,
                            onOpenDeepCleanSettings = onOpenDeepCleanSettings,
                        )
                        is UiState.Working -> WorkingView(s.progress)
                        is UiState.Done    -> DoneView(
                            summary = s.summary,
                            onDeleteBackedUp = onDeleteBackedUp,
                            onFinish = logic::reset,
                        )
                        // Treated above — included for exhaustiveness
                        is UiState.JunkReview, is UiState.LayerReview, is UiState.ShortcutsReview -> Unit
                    }
                    Spacer(Modifier.height(28.dp))
                }
            }
        }
    }
}

@Composable
private fun IdleView(onScan: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(40.dp))
        Text("✨", fontSize = 64.sp)
        Spacer(Modifier.height(16.dp))
        Text(
            "Vamos organizar a bagunça?",
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "O Tom analisa seu celular, envia fotos e vídeos para o Google Fotos, " +
                "organiza documentos por tipo e ano no Google Drive e encontra a " +
                "sujeira acumulada. Nada é apagado sem a sua aprovação.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(28.dp))
        Button(onClick = onScan, modifier = Modifier.fillMaxWidth()) {
            Text("Analisar meu celular")
        }
    }
}

@Composable
private fun ScanningView() {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(60.dp))
        CircularProgressIndicator()
        Spacer(Modifier.height(16.dp))
        Text("Analisando o celular…", style = MaterialTheme.typography.titleMedium)
        Text(
            "Procurando fotos, vídeos, documentos, sujeira e duplicados. " +
                "Nenhum arquivo é alterado nesta etapa.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ResultsView(
    report: ScanReport,
    hasDeepClean: Boolean,
    onBackup: () -> Unit,
    onReviewJunk: () -> Unit,
    onReviewLayer: (SuggestionLayer) -> Unit,
    onReviewShortcuts: () -> Unit,
    onRescan: () -> Unit,
    onOpenDeepCleanSettings: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {

        // ── Painel de pontuação "modo fábrica" ──────────────────────────
        FactoryScoreCard(score = report.score)

        // ── Limpeza em 3 camadas ────────────────────────────────────────
        if (report.suggestions.totalCount > 0) {
            Text(
                "LIMPEZA EM CAMADAS",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Bold,
            )
        }

        val s = report.suggestions
        if (s.layer1.isNotEmpty()) {
            LayerCard(
                emoji = "✅",
                label = "Camada 1 — Lixo Óbvio",
                desc = "Cache, temporários, APKs — sempre seguro",
                count = s.layer1.size,
                bytes = s.bytesL1,
                onClick = { onReviewLayer(SuggestionLayer.L1_OBVIOUS) },
            )
        }
        if (s.layer2.isNotEmpty()) {
            LayerCard(
                emoji = "🔍",
                label = "Camada 2 — Lixo com Critério",
                desc = "Fotos borradas, screenshots velhos, duplicatas",
                count = s.layer2.size,
                bytes = s.bytesL2,
                onClick = { onReviewLayer(SuggestionLayer.L2_CRITERIA) },
            )
        }
        if (s.layer3.isNotEmpty()) {
            LayerCard(
                emoji = "⚠️",
                label = "Camada 3 — Lixo com Cautela",
                desc = "Documentos e mídias pessoais antigos",
                count = s.layer3.size,
                bytes = s.bytesL3,
                onClick = { onReviewLayer(SuggestionLayer.L3_CAUTIOUS) },
            )
        }

        // ── Atalhos duplicados ──────────────────────────────────────────
        if (report.shortcuts.isNotEmpty()) {
            val totalExtras = report.shortcuts.sumOf { it.extras }
            ElevatedCard(
                modifier = Modifier.fillMaxWidth().clickable(onClick = onReviewShortcuts),
            ) {
                Row(
                    Modifier.fillMaxWidth().padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("📱 Ícones duplicados", fontWeight = FontWeight.Bold)
                        Text(
                            "$totalExtras ícone(s) extra(s) em ${report.shortcuts.size} app(s)",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    OutlinedButton(onClick = onReviewShortcuts) { Text("Limpar") }
                }
            }
        }

        // ── Cards de estatísticas ───────────────────────────────────────
        HorizontalDivider()
        Text(
            "VISÃO GERAL",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontWeight = FontWeight.Bold,
        )
        StatCard("📸 Fotos e vídeos", "${report.photosCount} fotos · ${report.videosCount} vídeos", report.mediaBytes)
        StatCard("📄 Documentos", "${report.documents.size} arquivos", report.documentBytes)
        StatCard("🗑️ Sujeira", "${report.junk.size} arquivos inúteis", report.junkBytes)
        StatCard("👯 Duplicados", "${report.duplicates.size} cópias repetidas", report.duplicateBytes)

        if (!hasDeepClean) {
            Card {
                Column(Modifier.padding(14.dp)) {
                    Text("Quer uma limpeza mais profunda?", fontWeight = FontWeight.Bold)
                    Text(
                        "Com o acesso total a arquivos, o Tom encontra sujeira " +
                            "escondida fora das pastas de fotos (temporários, sobras de apps).",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    TextButton(onClick = onOpenDeepCleanSettings) {
                        Text("Conceder acesso total")
                    }
                }
            }
        }

        Spacer(Modifier.height(4.dp))
        Button(onClick = onBackup, modifier = Modifier.fillMaxWidth()) {
            Text("☁️ Fazer backup na nuvem")
        }
        OutlinedButton(onClick = onReviewJunk, modifier = Modifier.fillMaxWidth()) {
            Text("🔍 Revisar sujeira (avançado)")
        }
        TextButton(onClick = onRescan, modifier = Modifier.fillMaxWidth()) {
            Text("Analisar de novo")
        }
        Text(
            "O backup só envia arquivos — não apaga nada. Toda exclusão " +
                "passa pela sua revisão e confirmação.",
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

// ── Pontuação modo fábrica ────────────────────────────────────────────────────

@Composable
private fun FactoryScoreCard(score: StorageScore) {
    val scoreColor = when {
        score.current >= 85 -> Color(0xFF10936A)
        score.current >= 65 -> Color(0xFFD97706)
        else                -> Color(0xFFDC2626)
    }
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column {
                    Text("Desempenho do celular", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                    Text(score.label(), style = MaterialTheme.typography.bodySmall, color = scoreColor, fontWeight = FontWeight.SemiBold)
                }
                // Score circle
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = { score.current / 100f },
                        modifier = Modifier.size(60.dp),
                        color = scoreColor,
                        strokeWidth = 5.dp,
                    )
                    Text("${score.current}%", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                }
            }
            // Progress bar: current vs projected
            if (score.projected > score.current) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Agora: ${score.current}%", style = MaterialTheme.typography.bodySmall)
                    Text("Após limpeza: ${score.projected}%", style = MaterialTheme.typography.bodySmall, color = Color(0xFF10936A))
                }
                LinearProgressIndicator(
                    progress = { score.projected / 100f },
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFF10936A),
                )
                Text(
                    "Você pode liberar ${formatBytes(score.junkBytes)} e recuperar ${score.projected - score.current} pontos de desempenho",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

// ── Card de camada de limpeza ─────────────────────────────────────────────────

@Composable
private fun LayerCard(
    emoji: String,
    label: String,
    desc: String,
    count: Int,
    bytes: Long,
    onClick: () -> Unit,
) {
    ElevatedCard(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(
            Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(emoji, fontSize = 24.sp)
                Column {
                    Text(label, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                    Text(desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(formatBytes(bytes), fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                Text("$count itens", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

// ── Revisão de camada de sugestões ───────────────────────────────────────────

@Composable
private fun LayerReviewView(
    layer: SuggestionLayer,
    suggestions: List<Suggestion>,
    modifier: Modifier = Modifier,
    onConfirm: (List<Suggestion>) -> Unit,
    onCancel: () -> Unit,
) {
    val checked = remember { mutableStateOf(setOf<String>()) }

    val title = when (layer) {
        SuggestionLayer.L1_OBVIOUS  -> "✅ Camada 1 — Lixo Óbvio"
        SuggestionLayer.L2_CRITERIA -> "🔍 Camada 2 — Lixo com Critério"
        SuggestionLayer.L3_CAUTIOUS -> "⚠️ Camada 3 — Cautela"
    }
    val hint = when (layer) {
        SuggestionLayer.L1_OBVIOUS  -> "Esses arquivos são sempre seguros para remover. Você pode aprovar tudo de uma vez."
        SuggestionLayer.L2_CRITERIA -> "Revise item a item. Itens borrados, duplicados e screenshots velhos costumam ser desnecessários."
        SuggestionLayer.L3_CAUTIOUS -> "Verifique cada item com cuidado. São arquivos pessoais antigos — confirme antes de aprovar."
    }

    val approved = suggestions.filter { it.id in checked.value }
    val approvedBytes = approved.sumOf { it.file.size }

    LazyColumn(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Spacer(Modifier.height(20.dp))
            Text(title, fontSize = 20.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(4.dp))
            Text(hint, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(4.dp))
            // Select all (only for L1)
            if (layer == SuggestionLayer.L1_OBVIOUS) {
                val allSelected = checked.value.size == suggestions.size
                TextButton(onClick = {
                    checked.value = if (allSelected) emptySet() else suggestions.map { it.id }.toSet()
                }) {
                    Text(if (allSelected) "Desmarcar tudo" else "Selecionar tudo (${suggestions.size} itens)")
                }
            }
            Spacer(Modifier.height(4.dp))
        }

        items(suggestions, key = { it.id }) { suggestion ->
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    Modifier.fillMaxWidth().clickable {
                        checked.value = if (suggestion.id in checked.value)
                            checked.value - suggestion.id else checked.value + suggestion.id
                    }.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(
                        checked = suggestion.id in checked.value,
                        onCheckedChange = {
                            checked.value = if (suggestion.id in checked.value)
                                checked.value - suggestion.id else checked.value + suggestion.id
                        }
                    )
                    Column(Modifier.weight(1f)) {
                        Text(
                            suggestion.file.name,
                            fontWeight = FontWeight.SemiBold,
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            suggestion.reason,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    Text(formatBytes(suggestion.file.size), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        item {
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = { onConfirm(approved) },
                enabled = approved.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    if (approved.isEmpty()) "Selecione itens para enviar à lixeira segura"
                    else "Enviar ${approved.size} itens à lixeira segura (${formatBytes(approvedBytes)})"
                )
            }
            OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) {
                Text("Voltar sem nenhuma ação")
            }
            Text(
                "Itens enviados à lixeira ficam lá por 7 dias antes de serem definitivamente excluídos. Você pode desfazer a qualquer momento.",
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(28.dp))
        }
    }
}

// ── Revisão de atalhos duplicados ─────────────────────────────────────────────

@Composable
private fun ShortcutsReviewView(
    groups: List<DuplicateShortcutGroup>,
    modifier: Modifier = Modifier,
    onConfirm: (Map<String, List<String>>) -> Unit,
    onCancel: () -> Unit,
) {
    // approved: packageName → lista de shortcutIds a desabilitar
    val approved = remember { mutableStateOf(mapOf<String, List<String>>()) }
    val totalApproved = approved.value.values.sumOf { it.size }

    LazyColumn(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Spacer(Modifier.height(20.dp))
            Text("📱 Ícones Duplicados", fontSize = 20.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(4.dp))
            Text(
                "Ícones duplicados na tela inicial causam confusão. O app NUNCA desinstala — apenas remove o atalho extra.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
        }

        items(groups, key = { it.packageName }) { group ->
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp)) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                Modifier.size(36.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(group.appLabel.take(1), fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text(group.appLabel, fontWeight = FontWeight.Bold)
                                Text("${group.extras} ícone(s) extra(s)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                    if (group.pinnedShortcutIds.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "${group.pinnedShortcutIds.size} atalho(s) fixado(s) podem ser removidos automaticamente.",
                            style = MaterialTheme.typography.bodySmall,
                        )
                        val isPkgApproved = approved.value.containsKey(group.packageName)
                        TextButton(onClick = {
                            approved.value = if (isPkgApproved)
                                approved.value - group.packageName
                            else approved.value + (group.packageName to group.pinnedShortcutIds)
                        }) {
                            Text(if (isPkgApproved) "Desmarcar" else "Remover atalhos fixados")
                        }
                    }
                    if (group.activityCount > 1) {
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "ℹ️ ${group.activityCount - 1} ícone(s) de launcher precisam ser removidos manualmente: pressione e segure o ícone extra → \"Remover da tela\".",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = { onConfirm(approved.value) },
                enabled = totalApproved > 0,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (totalApproved == 0) "Selecione atalhos para remover" else "Remover $totalApproved atalho(s) fixado(s)")
            }
            OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) {
                Text("Voltar sem alterar nada")
            }
            Text(
                "Apenas atalhos fixados são removidos automaticamente. Ícones do launcher principal precisam ser removidos manualmente seguindo as instruções acima.",
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun StatCard(title: String, subtitle: String, bytes: Long) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text(title, fontWeight = FontWeight.Bold)
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(formatBytes(bytes), fontWeight = FontWeight.SemiBold)
        }
    }
}

// ── Revisão da sujeira ────────────────────────────────────────────────

@Composable
private fun JunkReviewView(
    groups: List<JunkGroup>,
    modifier: Modifier = Modifier,
    onConfirm: (List<JunkFile>) -> Unit,
    onCancel: () -> Unit,
) {
    // Grupos marcados para exclusão (começam todos DESMARCADOS: opt-in)
    val checked = remember { mutableStateOf(setOf<String>()) }
    val expanded = remember { mutableStateOf(setOf<String>()) }

    val approvedFiles = groups
        .filter { it.reason in checked.value }
        .flatMap { it.files }
    val approvedBytes = approvedFiles.sumOf { it.size }

    LazyColumn(modifier = modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Spacer(Modifier.height(20.dp))
            Text("🔍 Revisar sujeira", fontSize = 22.sp, fontWeight = FontWeight.Black)
            Text(
                "Marque apenas o que pode ser apagado. Toque num grupo para ver " +
                    "todos os arquivos dele. Nada é excluído até você confirmar.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
        }

        items(groups, key = { it.reason }) { group ->
            JunkGroupCard(
                group = group,
                isChecked = group.reason in checked.value,
                isExpanded = group.reason in expanded.value,
                onToggleChecked = {
                    checked.value =
                        if (group.reason in checked.value) checked.value - group.reason
                        else checked.value + group.reason
                },
                onToggleExpanded = {
                    expanded.value =
                        if (group.reason in expanded.value) expanded.value - group.reason
                        else expanded.value + group.reason
                },
            )
        }

        item {
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = { onConfirm(approvedFiles) },
                enabled = approvedFiles.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    if (approvedFiles.isEmpty()) "Marque o que deseja apagar"
                    else "Apagar ${approvedFiles.size} arquivos (${formatBytes(approvedBytes)})"
                )
            }
            OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) {
                Text("Voltar sem apagar nada")
            }
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun JunkGroupCard(
    group: JunkGroup,
    isChecked: Boolean,
    isExpanded: Boolean,
    onToggleChecked: () -> Unit,
    onToggleExpanded: () -> Unit,
) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggleExpanded)
                    .padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Checkbox(checked = isChecked, onCheckedChange = { onToggleChecked() })
                Column(Modifier.weight(1f)) {
                    Text(group.reason, fontWeight = FontWeight.Bold)
                    Text(
                        "${group.files.size} arquivos · ${formatBytes(group.bytes)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Text(if (isExpanded) "▲" else "▼", color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(10.dp))
            }
            AnimatedVisibility(visible = isExpanded) {
                Column(Modifier.padding(start = 16.dp, end = 16.dp, bottom = 10.dp)) {
                    HorizontalDivider()
                    for (f in group.files) {
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(vertical = 3.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(
                                f.path,
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f),
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(formatBytes(f.size), style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

// ── Progresso e conclusão ─────────────────────────────────────────────

@Composable
private fun WorkingView(progress: BackupProgress) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Spacer(Modifier.height(48.dp))
        Text(progress.phase, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(20.dp))
        if (progress.total > 0) {
            LinearProgressIndicator(
                progress = { progress.done.toFloat() / progress.total },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(10.dp))
            Text("${progress.done} de ${progress.total}")
        } else {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        if (progress.currentFile.isNotBlank()) {
            Spacer(Modifier.height(6.dp))
            Text(
                progress.currentFile,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Spacer(Modifier.height(24.dp))
        Text(
            "Mantenha o app aberto e o celular conectado ao Wi-Fi.",
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun DoneView(
    summary: BackupSummary,
    onDeleteBackedUp: () -> Unit,
    onFinish: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("☁️", fontSize = 56.sp, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
        Text(
            "Backup concluído!",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center,
        )
        SummaryLine("Fotos e vídeos no Google Fotos", "${summary.photosSent} enviados" +
            if (summary.photosFailed > 0) " · ${summary.photosFailed} falharam" else "")
        SummaryLine("Documentos organizados no Drive (por tipo e ano)", "${summary.docsSent} enviados" +
            if (summary.docsFailed > 0) " · ${summary.docsFailed} falharam" else "")

        Text(
            "Nada foi apagado do seu celular até agora.",
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )

        if (summary.deletable.isNotEmpty()) {
            Text(
                "Tudo o que foi enviado já está seguro na nuvem. Se quiser, você pode " +
                    "liberar ${formatBytes(summary.deletableBytes)} apagando esses arquivos " +
                    "do aparelho — o sistema vai mostrar a lista e pedir sua confirmação.",
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Button(onClick = onDeleteBackedUp, modifier = Modifier.fillMaxWidth()) {
                Text("🧹 Revisar e liberar ${formatBytes(summary.deletableBytes)}")
            }
        }
        OutlinedButton(onClick = onFinish, modifier = Modifier.fillMaxWidth()) {
            Text("Concluir sem apagar nada")
        }
    }
}

@Composable
private fun SummaryLine(title: String, value: String) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp)) {
            Text(title, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontWeight = FontWeight.SemiBold)
        }
    }
}

fun formatBytes(bytes: Long): String {
    if (bytes <= 0) return "0 B"
    val units = listOf("B", "KB", "MB", "GB", "TB")
    var value = bytes.toDouble()
    var unit = 0
    while (value >= 1024 && unit < units.lastIndex) {
        value /= 1024
        unit++
    }
    return if (value >= 100 || unit == 0) {
        "${value.roundToInt()} ${units[unit]}"
    } else {
        val tenths = (value * 10).roundToInt()
        "${tenths / 10},${tenths % 10} ${units[unit]}"
    }
}
