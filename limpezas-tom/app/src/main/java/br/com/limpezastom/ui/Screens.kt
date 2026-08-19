package br.com.limpezastom.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
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
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.limpezastom.AppViewModel
import br.com.limpezastom.model.BackupProgress
import br.com.limpezastom.model.BackupSummary
import br.com.limpezastom.model.ScanReport
import br.com.limpezastom.model.UiState
import java.util.Locale

@Composable
fun AppRoot(
    viewModel: AppViewModel,
    onScanRequested: () -> Unit,
    onBackupRequested: () -> Unit,
    onDeleteBackedUp: () -> Unit,
    onOpenAllFilesSettings: () -> Unit,
) {
    MaterialTheme {
        val state by viewModel.state.collectAsState()
        val message by viewModel.message.collectAsState()
        val snackbar = remember { SnackbarHostState() }

        LaunchedEffect(message) {
            message?.let {
                snackbar.showSnackbar(it)
                viewModel.clearMessage()
            }
        }

        Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            Column(
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
                    "Backup na nuvem + faxina no celular",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(24.dp))

                when (val s = state) {
                    is UiState.Idle -> IdleView(onScanRequested)
                    is UiState.Scanning -> ScanningView()
                    is UiState.Results -> ResultsView(
                        report = s.report,
                        hasAllFiles = viewModel.hasAllFilesAccess(),
                        onBackup = onBackupRequested,
                        onCleanJunk = viewModel::cleanJunkOnly,
                        onRescan = onScanRequested,
                        onOpenAllFilesSettings = onOpenAllFilesSettings,
                    )
                    is UiState.Working -> WorkingView(s.progress)
                    is UiState.Done -> DoneView(
                        summary = s.summary,
                        onDeleteBackedUp = onDeleteBackedUp,
                        onFinish = viewModel::reset,
                    )
                }
                Spacer(Modifier.height(28.dp))
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
            "Vamos deixar seu celular limpinho?",
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "O Limpezas Tom analisa seu aparelho, envia fotos e vídeos para o " +
                "Google Fotos, documentos para o Google Drive e remove a sujeira " +
                "que só ocupa espaço.",
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
            "Procurando fotos, vídeos, documentos, sujeira e duplicados.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ResultsView(
    report: ScanReport,
    hasAllFiles: Boolean,
    onBackup: () -> Unit,
    onCleanJunk: () -> Unit,
    onRescan: () -> Unit,
    onOpenAllFilesSettings: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        StatCard("📸 Fotos e vídeos", "${report.photosCount} fotos · ${report.videosCount} vídeos", report.mediaBytes)
        StatCard("📄 Documentos", "${report.documents.size} arquivos", report.documentBytes)
        StatCard("🗑️ Sujeira", "${report.junk.size} arquivos inúteis", report.junkBytes)
        StatCard("👯 Duplicados", "${report.duplicates.size} cópias repetidas", report.duplicateBytes)

        if (!hasAllFiles) {
            Card {
                Column(Modifier.padding(14.dp)) {
                    Text("Quer uma limpeza mais profunda?", fontWeight = FontWeight.Bold)
                    Text(
                        "Com o acesso total a arquivos, o Tom encontra sujeira " +
                            "escondida fora das pastas de fotos (temporários, sobras de apps).",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    TextButton(onClick = onOpenAllFilesSettings) {
                        Text("Conceder acesso total")
                    }
                }
            }
        }

        Spacer(Modifier.height(8.dp))
        Button(onClick = onBackup, modifier = Modifier.fillMaxWidth()) {
            Text("☁️ Fazer backup e limpar tudo")
        }
        OutlinedButton(onClick = onCleanJunk, modifier = Modifier.fillMaxWidth()) {
            Text("Só limpar a sujeira (sem backup)")
        }
        TextButton(onClick = onRescan, modifier = Modifier.fillMaxWidth()) {
            Text("Analisar de novo")
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
        Text("🎉", fontSize = 56.sp, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
        Text(
            "Faxina concluída!",
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center,
        )
        SummaryLine("Fotos e vídeos no Google Fotos", "${summary.photosSent} enviados" +
            if (summary.photosFailed > 0) " · ${summary.photosFailed} falharam" else "")
        SummaryLine("Documentos no Google Drive", "${summary.docsSent} enviados" +
            if (summary.docsFailed > 0) " · ${summary.docsFailed} falharam" else "")
        SummaryLine("Sujeira removida", "${summary.junkDeleted} arquivos · ${formatBytes(summary.junkBytesFreed)}")

        if (summary.deletableUris.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            Text(
                "Tudo o que foi enviado já está seguro na nuvem. Quer liberar " +
                    "${formatBytes(summary.deletableBytes)} apagando esses arquivos do celular?",
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
            Button(onClick = onDeleteBackedUp, modifier = Modifier.fillMaxWidth()) {
                Text("🧹 Liberar ${formatBytes(summary.deletableBytes)} do celular")
            }
        }
        OutlinedButton(onClick = onFinish, modifier = Modifier.fillMaxWidth()) {
            Text("Concluir")
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
    return String.format(Locale("pt", "BR"), if (value >= 100) "%.0f %s" else "%.1f %s", value, units[unit])
}
