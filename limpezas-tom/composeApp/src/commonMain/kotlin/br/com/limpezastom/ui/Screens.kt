package br.com.limpezastom.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.model.BackupProgress
import br.com.limpezastom.model.BackupSummary
import br.com.limpezastom.model.JunkFile
import br.com.limpezastom.model.JunkGroup
import br.com.limpezastom.model.ScanReport
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
        val snackbar = remember { SnackbarHostState() }

        LaunchedEffect(message) {
            message?.let {
                snackbar.showSnackbar(it)
                logic.clearMessage()
            }
        }

        Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            when (val s = state) {
                // A revisão usa LazyColumn própria (a lista pode ser longa)
                is UiState.JunkReview -> JunkReviewView(
                    groups = s.groups,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 20.dp),
                    onConfirm = logic::confirmJunkCleanup,
                    onCancel = logic::cancelJunkReview,
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
                        "Organiza a bagunça de anos — sem apagar nada sem você aprovar",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(24.dp))

                    when (s) {
                        is UiState.Idle -> IdleView(onScanRequested)
                        is UiState.Scanning -> ScanningView()
                        is UiState.Results -> ResultsView(
                            report = s.report,
                            hasDeepClean = logic.hasDeepCleanAccess(),
                            onBackup = onBackupRequested,
                            onReviewJunk = logic::requestJunkReview,
                            onRescan = onScanRequested,
                            onOpenDeepCleanSettings = onOpenDeepCleanSettings,
                        )
                        is UiState.Working -> WorkingView(s.progress)
                        is UiState.Done -> DoneView(
                            summary = s.summary,
                            onDeleteBackedUp = onDeleteBackedUp,
                            onFinish = logic::reset,
                        )
                        is UiState.JunkReview -> Unit // tratado acima
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
    onRescan: () -> Unit,
    onOpenDeepCleanSettings: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
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

        Spacer(Modifier.height(8.dp))
        Button(onClick = onBackup, modifier = Modifier.fillMaxWidth()) {
            Text("☁️ Fazer backup na nuvem")
        }
        OutlinedButton(onClick = onReviewJunk, modifier = Modifier.fillMaxWidth()) {
            Text("🔍 Revisar sujeira antes de limpar")
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
