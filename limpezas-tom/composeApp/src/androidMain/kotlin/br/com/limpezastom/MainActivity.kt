package br.com.limpezastom

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.logic.LogicHolder
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AppRoot(
                logic = logic,
                onScanRequested = ::scanWithPermissions,
                onOpenGooglePhotos = ::openGooglePhotos,
                onOpenDeepCleanSettings = ::openAllFilesSettings,
            )
        }
    }

    private fun scanWithPermissions() {
        // Android 14+: solicita acesso parcial à galeria além do acesso total,
        // para que o app funcione mesmo quando o usuário concede acesso seletivo.
        val needed = when {
            Build.VERSION.SDK_INT >= 34 -> arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED,
            )
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ->
                arrayOf(Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VIDEO)
            else ->
                arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) logic.scan()
        else permissionLauncher.launch(missing.toTypedArray())
    }

    /**
     * Ao retornar da tela de configurações (após o usuário conceder o acesso
     * total a arquivos), atualiza a tela de resultados para refletir o novo
     * estado sem forçar uma re-análise completa.
     */
    override fun onResume() {
        super.onResume()
        logic.refreshDeepCleanStatus()
    }

    /** Abre o Google Fotos para que o usuário faça backup e, depois, libere espaço no celular. */
    private fun openGooglePhotos() {
        val pm = packageManager
        val photosPackage = "com.google.android.apps.photos"
        val intent = pm.getLaunchIntentForPackage(photosPackage)
        if (intent != null) {
            startActivity(intent)
        } else {
            // Google Fotos não instalado — abre Play Store
            runCatching {
                startActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$photosPackage"))
                )
            }.onFailure {
                startActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$photosPackage"))
                )
            }
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
