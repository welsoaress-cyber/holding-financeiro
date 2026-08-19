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
import androidx.core.content.ContextCompat
import br.com.limpezastom.cloud.GoogleAuth
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.model.UiState
import br.com.limpezastom.ui.AppRoot

class MainActivity : ComponentActivity() {

    private val logic: AppLogic by lazy { LogicHolder.get(applicationContext) }

    // Permissões de leitura de mídia → dispara a análise
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        if (grants.values.any { it }) logic.scan()
        else logic.notify("Sem permissão de acesso às fotos, não dá para analisar.")
    }

    // Tela de consentimento do Google → segue com o backup
    private val authLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val token = GoogleAuth.tokenFromResult(this, result.data)
            if (token != null) logic.startBackup(token)
            else logic.notify("Não foi possível obter autorização do Google.")
        } else {
            logic.notify("Autorização do Google cancelada.")
        }
    }

    // Diálogo do sistema confirmando exclusão dos itens já salvos na nuvem
    private val deleteLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) logic.onDeviceCleanupDone()
        else logic.notify("Exclusão cancelada — os arquivos continuam no celular.")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppRoot(
                logic = logic,
                onScanRequested = ::scanWithPermissions,
                onBackupRequested = ::startAuthorization,
                onDeleteBackedUp = ::requestDeviceCleanup,
                onOpenDeepCleanSettings = ::openAllFilesSettings,
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
        if (missing.isEmpty()) logic.scan()
        else permissionLauncher.launch(missing.toTypedArray())
    }

    private fun startAuthorization() {
        GoogleAuth.requestAuthorization(
            activity = this,
            onToken = { logic.startBackup(it) },
            onResolutionNeeded = { authLauncher.launch(it) },
            onError = {
                logic.notify(
                    "Falha ao conectar com o Google: ${it.message ?: "erro desconhecido"}"
                )
            },
        )
    }

    /** Pede ao sistema a exclusão (com confirmação) dos itens já salvos na nuvem. */
    private fun requestDeviceCleanup() {
        val summary = (logic.state.value as? UiState.Done)?.summary ?: return
        val uris: List<Uri> = summary.deletable.map { Uri.parse(it.id) }
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
            logic.notify("$deleted arquivos removidos do celular.")
            logic.reset()
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
