package br.com.limpezastom

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import br.com.limpezastom.cloud.GoogleAuth
import br.com.limpezastom.model.UiState
import br.com.limpezastom.ui.AppRoot

class MainActivity : ComponentActivity() {

    private val viewModel: AppViewModel by viewModels()

    // Permissões de leitura de mídia → dispara a análise
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        if (grants.values.any { it }) viewModel.scan()
        else viewModel.notify("Sem permissão de acesso às fotos, não dá para analisar.")
    }

    // Tela de consentimento do Google → segue com o backup
    private val authLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val token = GoogleAuth.tokenFromResult(this, result.data)
            if (token != null) viewModel.startBackup(token)
            else viewModel.notify("Não foi possível obter autorização do Google.")
        } else {
            viewModel.notify("Autorização do Google cancelada.")
        }
    }

    // Diálogo do sistema confirmando exclusão dos itens já salvos na nuvem
    private val deleteLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) viewModel.onDeviceCleanupDone()
        else viewModel.notify("Exclusão cancelada — os arquivos continuam no celular.")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppRoot(
                viewModel = viewModel,
                onScanRequested = ::scanWithPermissions,
                onBackupRequested = ::startAuthorization,
                onDeleteBackedUp = ::requestDeviceCleanup,
                onOpenAllFilesSettings = ::openAllFilesSettings,
            )
        }
    }

    private fun scanWithPermissions() {
        val needed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VIDEO)
        } else {
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) viewModel.scan()
        else permissionLauncher.launch(missing.toTypedArray())
    }

    private fun startAuthorization() {
        GoogleAuth.requestAuthorization(
            activity = this,
            onToken = { viewModel.startBackup(it) },
            onResolutionNeeded = { authLauncher.launch(it) },
            onError = {
                viewModel.notify(
                    "Falha ao conectar com o Google: ${it.message ?: "erro desconhecido"}"
                )
            },
        )
    }

    /** Pede ao sistema a exclusão (com confirmação) dos itens já salvos na nuvem. */
    private fun requestDeviceCleanup() {
        val summary = (viewModel.state.value as? UiState.Done)?.summary ?: return
        val uris: List<Uri> = summary.deletableUris
        if (uris.isEmpty()) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val pending = MediaStore.createDeleteRequest(contentResolver, uris)
            deleteLauncher.launch(IntentSenderRequest.Builder(pending.intentSender).build())
        } else {
            var deleted = 0
            for (uri in uris) {
                runCatching { contentResolver.delete(uri, null, null) }
                    .onSuccess { if (it > 0) deleted++ }
            }
            viewModel.notify("$deleted arquivos removidos do celular.")
            viewModel.reset()
        }
    }

    private fun openAllFilesSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            runCatching {
                startActivity(
                    Intent(
                        Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                        Uri.parse("package:$packageName"),
                    )
                )
            }.onFailure {
                startActivity(Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION))
            }
        }
    }
}
