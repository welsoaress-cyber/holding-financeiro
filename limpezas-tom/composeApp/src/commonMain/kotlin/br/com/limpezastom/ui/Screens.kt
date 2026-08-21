package br.com.limpezastom.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.UiState
import br.com.limpezastom.platform.nowMs
import kotlin.math.roundToInt

const val APP_VERSION = "0.2.0"

@Composable
fun AppRoot(
    logic: AppLogic,
    onScanRequested: () -> Unit,
    onPickFolder: () -> Unit,
) {
    MaterialTheme {
        val state   by logic.state.collectAsState()
        val message by logic.message.collectAsState()
        val snackbar = remember { SnackbarHostState() }

        LaunchedEffect(message) {
            message?.let { snackbar.showSnackbar(it); logic.clearMessage() }
        }

        Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            Box(
                Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 20.dp),
            ) {
                when (val s = state) {
                    is UiState.Idle      -> IdleView(onScan = onScanRequested)
                    is UiState.Scanning  -> ScanningView()
                    is UiState.Found     -> FoundView(
                        screenshots = s.screenshots,
                        sinkReady   = s.sinkReady,
                        onPickFolder = onPickFolder,
                        onBackup    = logic::startBackup,
                        onRescan    = onScanRequested,
                    )
                    is UiState.Uploading -> UploadingView(s)
                    is UiState.Done      -> DoneView(s, onReset = logic::reset)
                }
            }
        }
    }
}

// ── Versão ────────────────────────────────────────────────────────────────────

@Composable
private fun VersionLabel() {
    Text(
        "v$APP_VERSION",
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth(),
    )
}

// ── Tela inicial ──────────────────────────────────────────────────────────────

@Composable
private fun IdleView(onScan: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("📸", fontSize = 72.sp)
        Spacer(Modifier.height(20.dp))
        Text(
            "Backup de Screenshots",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Encontra todos os prints de tela e envia para uma pasta no Google Drive — " +
                "com nome e data do dia. Nenhum arquivo é excluído do celular.",
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(28.dp))
        Button(onClick = onScan, modifier = Modifier.fillMaxWidth()) {
            Text("Identificar screenshots")
        }
        Spacer(Modifier.height(16.dp))
        VersionLabel()
    }
}

// ── Scanning ──────────────────────────────────────────────────────────────────

@Composable
private fun ScanningView() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator()
        Spacer(Modifier.height(16.dp))
        Text("Procurando screenshots…", style = MaterialTheme.typography.titleMedium)
        Text(
            "Nenhum arquivo é alterado.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(24.dp))
        VersionLabel()
    }
}

// ── Screenshots encontrados ───────────────────────────────────────────────────

@Composable
private fun FoundView(
    screenshots: List<FileRef>,
    sinkReady: Boolean,
    onPickFolder: () -> Unit,
    onBackup: (List<FileRef>) -> Unit,
    onRescan: () -> Unit,
) {
    val selected = remember { mutableStateOf(setOf<String>()) }
    val approvedList = screenshots.filter { it.id in selected.value }
    val approvedBytes = approvedList.sumOf { it.size }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // ── Cabeçalho ─────────────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(20.dp))
            Text(
                "📸 ${screenshots.size} screenshot(s) encontrado(s)",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
        }

        // ── Card de pasta de destino ──────────────────────────────────────────
        item {
            if (!sinkReady) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text("📁 Escolha onde salvar", fontWeight = FontWeight.Bold)
                        Text(
                            "Selecione uma pasta no Google Drive (ou em outro local). " +
                                "O app cria uma subpasta com o nome e horário do backup.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = onPickFolder, modifier = Modifier.fillMaxWidth()) {
                            Text("Escolher pasta no Drive")
                        }
                    }
                }
            } else {
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text("✅", fontSize = 20.sp)
                        Column {
                            Text("Pasta de destino configurada", fontWeight = FontWeight.SemiBold)
                            Text(
                                "Os screenshots irão para uma subpasta com a data/hora de agora.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }

        // ── Botões de ação (no topo, antes da lista) ──────────────────────────
        item {
            Spacer(Modifier.height(4.dp))
            Button(
                onClick = { onBackup(approvedList) },
                enabled = sinkReady && approvedList.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    when {
                        !sinkReady             -> "Escolha uma pasta primeiro"
                        approvedList.isEmpty() -> "Selecione os screenshots"
                        else -> "☁️ Enviar ${approvedList.size} screenshot(s) para o Drive"
                    }
                )
            }
            if (!sinkReady && approvedList.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                Button(
                    onClick = onPickFolder,
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("📁 Escolher pasta no Drive") }
            }
            OutlinedButton(
                onClick = onRescan,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Analisar de novo")
            }
        }

        // ── Selecionar tudo ───────────────────────────────────────────────────
        item {
            if (screenshots.isNotEmpty()) {
                val allSelected = selected.value.size == screenshots.size
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (selected.value.isNotEmpty()) {
                        Text(
                            "${selected.value.size} selecionado(s) — ${formatBytes(approvedBytes)}",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary,
                        )
                    } else {
                        Text(
                            "Selecione os screenshots para enviar",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    TextButton(onClick = {
                        selected.value = if (allSelected) emptySet()
                        else screenshots.map { it.id }.toSet()
                    }) {
                        Text(if (allSelected) "Desmarcar tudo" else "Selecionar tudo")
                    }
                }
            }
        }

        // ── Lista de screenshots ──────────────────────────────────────────────
        if (screenshots.isEmpty()) {
            item {
                Column(
                    Modifier.fillMaxWidth().padding(vertical = 40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("✨", fontSize = 48.sp)
                    Spacer(Modifier.height(8.dp))
                    Text("Nenhum screenshot encontrado", fontWeight = FontWeight.SemiBold)
                    Text(
                        "Tire um print de tela e tente de novo.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        items(screenshots, key = { it.id }) { file ->
            val isSelected = file.id in selected.value
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    selected.value = if (isSelected)
                        selected.value - file.id
                    else
                        selected.value + file.id
                },
            ) {
                Row(
                    Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(
                        checked = isSelected,
                        onCheckedChange = {
                            selected.value = if (isSelected)
                                selected.value - file.id else selected.value + file.id
                        },
                    )
                    Column(Modifier.weight(1f)) {
                        Text(
                            file.name,
                            fontWeight = FontWeight.SemiBold,
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                formatBytes(file.size),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            if (file.lastModifiedMs > 0) {
                                Text(
                                    fileAge(file.lastModifiedMs),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Rodapé ────────────────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(12.dp))
            VersionLabel()
            Spacer(Modifier.height(28.dp))
        }
    }
}

// ── Progresso do upload ───────────────────────────────────────────────────────

@Composable
private fun UploadingView(state: UiState.Uploading) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("☁️ Enviando para o Drive…", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(20.dp))
        if (state.total > 0) {
            LinearProgressIndicator(
                progress = { state.done.toFloat() / state.total },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Text("${state.done} de ${state.total}")
        } else {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        if (state.currentName.isNotBlank()) {
            Spacer(Modifier.height(6.dp))
            Text(
                state.currentName,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(Modifier.height(12.dp))
        Text(
            "Mantenha o app aberto.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(24.dp))
        VersionLabel()
    }
}

// ── Concluído ─────────────────────────────────────────────────────────────────

@Composable
private fun DoneView(state: UiState.Done, onReset: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("✅", fontSize = 64.sp)
        Spacer(Modifier.height(16.dp))
        Text(
            "${state.count} screenshot(s) enviado(s)!",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Pasta criada no Drive:",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            "\"${state.folderName}\"",
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF10936A),
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            "Os arquivos ainda estão no celular — para liberar espaço, " +
                "use o botão \"Liberar espaço\" no Google Fotos.",
            style = MaterialTheme.typography.bodySmall,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(28.dp))
        Button(onClick = onReset, modifier = Modifier.fillMaxWidth()) {
            Text("Fazer novo backup")
        }
        Spacer(Modifier.height(16.dp))
        VersionLabel()
    }
}

// ── Utilitários ───────────────────────────────────────────────────────────────

fun formatBytes(bytes: Long): String {
    if (bytes <= 0) return "0 B"
    val units = listOf("B", "KB", "MB", "GB")
    var value = bytes.toDouble()
    var unit = 0
    while (value >= 1024 && unit < units.lastIndex) { value /= 1024; unit++ }
    return if (value >= 100 || unit == 0) "${value.roundToInt()} ${units[unit]}"
    else {
        val tenths = (value * 10).roundToInt()
        "${tenths / 10},${tenths % 10} ${units[unit]}"
    }
}

private fun fileAge(lastModifiedMs: Long): String {
    val diffMs = nowMs() - lastModifiedMs
    if (diffMs <= 0) return ""
    val days = diffMs / 86_400_000L
    return when {
        days < 1   -> "hoje"
        days == 1L -> "ontem"
        days < 7   -> "há $days dias"
        days < 30  -> "há ${days / 7} semana(s)"
        days < 365 -> "há ${days / 30} mês/meses"
        else       -> "há ${days / 365} ano(s)"
    }
}
