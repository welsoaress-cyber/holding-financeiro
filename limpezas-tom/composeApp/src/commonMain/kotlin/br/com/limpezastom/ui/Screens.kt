package br.com.limpezastom.ui

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.material3.TriStateCheckbox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.model.DuplicateShortcutGroup
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.UiState
import br.com.limpezastom.platform.formatMonthYear
import br.com.limpezastom.platform.nowMs
import kotlin.math.roundToInt

const val APP_VERSION = "0.2.0"

@Composable
fun AppRoot(
    logic: AppLogic,
    onScanRequested: () -> Unit,
    onPickFolder: () -> Unit,
    onPickFolderThenBackup: (List<FileRef>) -> Unit,
    onOpenAppSettings: (packageName: String) -> Unit,
    /** Chamado quando o usuário quer excluir os arquivos do celular após o backup. */
    onDeleteFiles: (List<FileRef>) -> Unit = {},
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
                    is UiState.Idle             -> HomeView(
                        onScanScreenshots = onScanRequested,
                        onScanShortcuts   = logic::scanShortcuts,
                    )
                    is UiState.Scanning         -> ScanningView("Procurando screenshots…")
                    is UiState.Found            -> FoundView(
                        screenshots            = s.screenshots,
                        sinkReady              = s.sinkReady,
                        onPickFolder           = onPickFolder,
                        onBackup               = logic::startBackup,
                        onPickFolderThenBackup = onPickFolderThenBackup,
                        onRescan               = onScanRequested,
                        onBack                 = logic::reset,
                    )
                    is UiState.Uploading        -> UploadingView(s)
                    is UiState.Done             -> DoneView(
                        state          = s,
                        onReset        = logic::reset,
                        onDeleteFiles  = onDeleteFiles,
                    )
                    is UiState.ScanningShortcuts -> ScanningView("Verificando atalhos duplicados…")
                    is UiState.FoundShortcuts   -> ShortcutsFoundView(
                        groups           = s.groups,
                        onRescan         = logic::scanShortcuts,
                        onDisable        = logic::disableShortcutsFor,
                        onOpenAppSettings = onOpenAppSettings,
                        onBack           = logic::reset,
                    )
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

// ── Tela inicial (hub) ────────────────────────────────────────────────────────

@Composable
private fun HomeView(
    onScanScreenshots: () -> Unit,
    onScanShortcuts: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Spacer(Modifier.height(32.dp))
            Text(
                "🧹 Limpezas Tom",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "Ferramentas de organização para o seu celular.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(20.dp))
        }

        // ── Card: Backup de screenshots ───────────────────────────────────────
        item {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                onClick  = onScanScreenshots,
            ) {
                Column(Modifier.padding(18.dp)) {
                    Text("📸", fontSize = 36.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Backup de Screenshots",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Encontra todos os prints de tela e os move para o seu Google Drive " +
                            "em uma pasta com a data de hoje, liberando espaço no celular.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = onScanScreenshots, modifier = Modifier.fillMaxWidth()) {
                        Text("Identificar screenshots")
                    }
                }
            }
        }

        // ── Card: Atalhos duplicados ──────────────────────────────────────────
        item {
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                onClick  = onScanShortcuts,
            ) {
                Column(Modifier.padding(18.dp)) {
                    Text("🔗", fontSize = 36.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Atalhos Duplicados",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Detecta apps que aparecem mais de uma vez na tela inicial — como " +
                            "iFood ou Caixa com múltiplos ícones — e orienta como removê-los.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(12.dp))
                    Button(onClick = onScanShortcuts, modifier = Modifier.fillMaxWidth()) {
                        Text("Verificar tela inicial")
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            VersionLabel()
            Spacer(Modifier.height(28.dp))
        }
    }
}

// ── Scanning (genérico) ───────────────────────────────────────────────────────

@Composable
private fun ScanningView(label: String) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator()
        Spacer(Modifier.height(16.dp))
        Text(label, style = MaterialTheme.typography.titleMedium)
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
    onPickFolderThenBackup: (List<FileRef>) -> Unit,
    onRescan: () -> Unit,
    onBack: () -> Unit,
) {
    val selected = remember { mutableStateOf(setOf<String>()) }

    // Agrupamento por mês/ano — preserva ordem descendente (screenshots já ordenados)
    val monthGroups: List<Pair<String, List<FileRef>>> = remember(screenshots) {
        val linked = linkedMapOf<String, MutableList<FileRef>>()
        for (file in screenshots) {
            val key = if (file.lastModifiedMs > 0)
                formatMonthYear(file.lastModifiedMs) else "Sem data"
            linked.getOrPut(key) { mutableListOf() }.add(file)
        }
        linked.map { (k, v) -> k to v.toList() }
    }

    val expandedGroups = remember { mutableStateMapOf<String, Boolean>() }
    val approvedList  = screenshots.filter { it.id in selected.value }
    val approvedBytes = approvedList.sumOf { it.size }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // ── Cabeçalho ─────────────────────────────────────────────────────────
        item {
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                TextButton(onClick = onBack) { Text("← Início") }
                Spacer(Modifier.weight(1f))
            }
            Text(
                "📸 ${screenshots.size} screenshot(s) encontrado(s)",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
        }

        // ── Card de destino (Drive) ───────────────────────────────────────────
        item {
            if (!sinkReady) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(14.dp)) {
                        Text("☁️ Destino: Google Drive", fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "Faça login com sua conta Google e os screenshots serão " +
                                "enviados automaticamente para uma pasta \"Backup - data\" " +
                                "no seu Google Drive. Nenhuma configuração manual necessária.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.height(10.dp))
                        Button(onClick = onPickFolder, modifier = Modifier.fillMaxWidth()) {
                            Text("🔑 Conectar ao Google Drive")
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
                        Column(Modifier.weight(1f)) {
                            Text("Google Drive conectado", fontWeight = FontWeight.SemiBold)
                            Text(
                                "Pasta \"Backup - data\" criada automaticamente no Drive.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        TextButton(onClick = onPickFolder) { Text("Trocar conta") }
                    }
                }
            }
        }

        // ── Botões de ação ────────────────────────────────────────────────────
        item {
            val hasSelection = approvedList.isNotEmpty()
            Button(
                onClick = {
                    if (sinkReady) onBackup(approvedList)
                    else onPickFolderThenBackup(approvedList)
                },
                enabled = hasSelection,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    when {
                        !hasSelection -> "Selecione os screenshots"
                        !sinkReady    -> "🔑 Conectar ao Drive e mover ${approvedList.size} screenshot(s)"
                        else          -> "☁️ Mover ${approvedList.size} para o Drive — ${formatBytes(approvedBytes)}"
                    }
                )
            }
            OutlinedButton(onClick = onRescan, modifier = Modifier.fillMaxWidth()) {
                Text("Analisar de novo")
            }
        }

        // ── Grupos por mês/ano ────────────────────────────────────────────────
        if (monthGroups.isEmpty()) {
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

        for ((groupLabel, groupFiles) in monthGroups) {
            val isExpanded    = expandedGroups.getOrDefault(groupLabel, false)
            val groupSelected = groupFiles.count { it.id in selected.value }
            val groupBytes    = groupFiles.sumOf { it.size }

            item(key = "header_$groupLabel") {
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { expandedGroups[groupLabel] = !isExpanded }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TriStateCheckbox(
                        state = when {
                            groupSelected == groupFiles.size -> ToggleableState.On
                            groupSelected > 0               -> ToggleableState.Indeterminate
                            else                            -> ToggleableState.Off
                        },
                        onClick = {
                            val ids = groupFiles.map { it.id }.toSet()
                            selected.value = if (groupSelected == groupFiles.size)
                                selected.value - ids
                            else
                                selected.value + ids
                        },
                    )
                    Column(Modifier.weight(1f).padding(start = 4.dp)) {
                        Text(groupLabel, fontWeight = FontWeight.SemiBold)
                        Text(
                            "${groupFiles.size} screenshot(s) · ${formatBytes(groupBytes)}" +
                                if (groupSelected > 0) " · $groupSelected selecionado(s)" else "",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (groupSelected > 0)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Text(
                        if (isExpanded) "▼" else "▶",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(end = 4.dp),
                    )
                }
            }

            if (isExpanded) {
                items(groupFiles, key = { it.id }) { file ->
                    val isSelected = file.id in selected.value
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            selected.value = if (isSelected)
                                selected.value - file.id else selected.value + file.id
                        },
                    ) {
                        Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
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
            }
        }

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
        Text("☁️ Movendo para o Drive…", style = MaterialTheme.typography.titleMedium)
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
private fun DoneView(
    state: UiState.Done,
    onReset: () -> Unit,
    onDeleteFiles: (List<FileRef>) -> Unit,
) {
    val hasFiles = state.backedUpFiles.isNotEmpty()
    val totalBytes = state.backedUpFiles.sumOf { it.size }

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
        Text("Pasta criada no Google Drive:", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            "\"${state.folderName}\"",
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF10936A),
            textAlign = TextAlign.Center,
        )

        // ── Excluir do celular ────────────────────────────────────────────────
        if (hasFiles) {
            Spacer(Modifier.height(20.dp))
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("⚠️")
                        Text(
                            "Os originais ainda estão no celular.",
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Para liberar ${formatBytes(totalBytes)} de espaço, exclua os arquivos do celular. " +
                            "Eles já estão seguros na pasta de backup.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(10.dp))
                    Button(
                        onClick = { onDeleteFiles(state.backedUpFiles) },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("🗑️ Excluir ${state.count} arquivo(s) do celular")
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = onReset, modifier = Modifier.fillMaxWidth()) {
            Text("Voltar ao início")
        }
        Spacer(Modifier.height(16.dp))
        VersionLabel()
    }
}

// ── Atalhos duplicados ────────────────────────────────────────────────────────

@Composable
private fun ShortcutsFoundView(
    groups: List<DuplicateShortcutGroup>,
    onRescan: () -> Unit,
    onDisable: (DuplicateShortcutGroup) -> Unit,
    onOpenAppSettings: (String) -> Unit,
    onBack: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                TextButton(onClick = onBack) { Text("← Início") }
                Spacer(Modifier.weight(1f))
            }
            Text(
                "🔗 Atalhos duplicados",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(4.dp))
        }

        if (groups.isEmpty()) {
            item {
                Column(
                    Modifier.fillMaxWidth().padding(vertical = 40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("✨", fontSize = 48.sp)
                    Spacer(Modifier.height(8.dp))
                    Text("Tela inicial limpa!", fontWeight = FontWeight.SemiBold)
                    Text(
                        "Nenhum app com ícone duplicado encontrado.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        } else {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("ℹ️")
                        Text(
                            "${groups.size} app(s) com ícone duplicado na tela inicial. " +
                                "Para remover: toque e segure o ícone extra → \"Remover da tela inicial\".",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            items(groups, key = { it.packageName }) { group ->
                ShortcutGroupCard(
                    group            = group,
                    onDisable        = { onDisable(group) },
                    onOpenAppSettings = { onOpenAppSettings(group.packageName) },
                )
            }
        }

        item {
            OutlinedButton(onClick = onRescan, modifier = Modifier.fillMaxWidth()) {
                Text("Verificar de novo")
            }
            Spacer(Modifier.height(12.dp))
            VersionLabel()
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun ShortcutGroupCard(
    group: DuplicateShortcutGroup,
    onDisable: () -> Unit,
    onOpenAppSettings: () -> Unit,
) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp)) {
            // ── Cabeçalho do app ──────────────────────────────────────────────
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text("📱", fontSize = 28.sp)
                Column(Modifier.weight(1f)) {
                    Text(group.appLabel, fontWeight = FontWeight.Bold)
                    Text(
                        "${group.activityCount} ícone(s) na tela inicial · ${group.extras} extra(s)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }

            // ── Rótulos das atividades ────────────────────────────────────────
            if (group.activityLabels.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    "Ícones detectados:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                group.activityLabels.forEachIndexed { i, label ->
                    val isFirst = i == 0
                    Text(
                        "  ${if (isFirst) "✅" else "❌"} $label${if (isFirst) " (manter)" else " (remover)"}",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isFirst)
                            MaterialTheme.colorScheme.onSurface
                        else
                            MaterialTheme.colorScheme.error,
                    )
                }
            }

            // ── Instruções ────────────────────────────────────────────────────
            Spacer(Modifier.height(10.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(10.dp)) {
                    Text(
                        "Como remover o ícone extra:",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        "1. Toque e segure o ícone duplicado na tela inicial\n" +
                            "2. Arraste para \"Remover da tela inicial\" ou toque em ✕",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // ── Botões ────────────────────────────────────────────────────────
            Spacer(Modifier.height(10.dp))
            Button(onClick = onOpenAppSettings, modifier = Modifier.fillMaxWidth()) {
                Text("Abrir configurações do app")
            }
            if (group.pinnedShortcutIds.isNotEmpty()) {
                Spacer(Modifier.height(4.dp))
                OutlinedButton(onClick = onDisable, modifier = Modifier.fillMaxWidth()) {
                    Text("Desabilitar atalhos fixados (${group.pinnedShortcutIds.size})")
                }
            }
        }
    }
}

// ── Progresso do upload ───────────────────────────────────────────────────────

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
