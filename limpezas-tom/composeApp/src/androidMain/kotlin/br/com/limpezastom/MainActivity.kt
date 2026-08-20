package br.com.limpezastom

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import br.com.limpezastom.backup.DriveFolder
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.ui.AppRoot

class MainActivity : ComponentActivity() {

    private val logic: AppLogic by lazy { LogicHolder.get(applicationContext) }

    // Permissões de leitura de imagens
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        if (grants.values.any { it }) logic.scan()
        else logic.notify("Sem permissão de leitura de fotos. Não é possível listar screenshots.")
    }

    // Seletor de pasta (Drive, SD card, armazenamento local…)
    private val folderPicker = registerForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri ->
        if (uri == null) return@registerForActivityResult
        // Persiste a permissão para sobreviver a reinicializações do app
        contentResolver.takePersistableUriPermission(
            uri,
            Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION,
        )
        // Salva o URI nas preferências para restaurar na próxima abertura
        getSharedPreferences("backup_prefs", MODE_PRIVATE)
            .edit()
            .putString("folder_uri", uri.toString())
            .apply()
        logic.backupSink = DriveFolder(this, uri)
        logic.onSinkReady()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Restaura a pasta salva (se ainda tiver permissão)
        restoreSavedFolder()

        setContent {
            AppRoot(
                logic          = logic,
                onScanRequested = ::scanWithPermissions,
                onPickFolder   = { folderPicker.launch(null) },
            )
        }
    }

    private fun restoreSavedFolder() {
        val uriStr = getSharedPreferences("backup_prefs", MODE_PRIVATE)
            .getString("folder_uri", null) ?: return
        val uri = runCatching { Uri.parse(uriStr) }.getOrNull() ?: return
        // Verifica se ainda há permissão persistida
        val hasPermission = contentResolver.persistedUriPermissions
            .any { it.uri == uri && it.isReadPermission && it.isWritePermission }
        if (hasPermission) {
            logic.backupSink = DriveFolder(this, uri)
        }
    }

    private fun scanWithPermissions() {
        val needed = when {
            Build.VERSION.SDK_INT >= 34 -> arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED,
            )
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ->
                arrayOf(Manifest.permission.READ_MEDIA_IMAGES)
            else ->
                arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) logic.scan()
        else permissionLauncher.launch(missing.toTypedArray())
    }
}
