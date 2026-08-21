package br.com.limpezastom

import android.Manifest
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
import br.com.limpezastom.backup.DriveFolder
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.ui.AppRoot

class MainActivity : ComponentActivity() {

    private val logic: AppLogic by lazy { LogicHolder.get(applicationContext) }

    /**
     * Lista de arquivos aguardando o usuário escolher a pasta antes de fazer backup.
     * Preenchida quando o usuário clica "Escolher pasta e enviar" sem pasta configurada.
     */
    private var pendingFiles: List<FileRef> = emptyList()

    /**
     * Quantidade de arquivos aguardando confirmação de exclusão pelo sistema (Android 10+).
     * Salvo antes de lançar o system dialog; usado no callback para notificar o logic.
     */
    private var pendingDeleteCount: Int = 0

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
        if (uri == null) {
            pendingFiles = emptyList()
            return@registerForActivityResult
        }
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

        // Se há arquivos pendentes, inicia o backup imediatamente
        val pending = pendingFiles
        pendingFiles = emptyList()
        if (pending.isNotEmpty()) {
            logic.startBackup(pending)
        } else {
            logic.onSinkReady()
        }
    }

    /**
     * Resultado do diálogo de exclusão do sistema (Android 11+).
     * RESULT_OK = usuário confirmou; notifica o logic para atualizar a UI.
     */
    private val deleteLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        val deleted = pendingDeleteCount
        pendingDeleteCount = 0
        if (result.resultCode == RESULT_OK && deleted > 0) {
            logic.notifyDeletion(deleted)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Restaura a pasta salva (se ainda tiver permissão)
        restoreSavedFolder()

        setContent {
            AppRoot(
                logic                  = logic,
                onScanRequested        = ::scanWithPermissions,
                onPickFolder           = { folderPicker.launch(null) },
                onPickFolderThenBackup = { files ->
                    pendingFiles = files
                    folderPicker.launch(null)
                },
                onOpenAppSettings      = { pkg ->
                    startActivity(
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                            .setData(Uri.parse("package:$pkg"))
                    )
                },
                onDeleteFiles          = ::deleteFiles,
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

    /**
     * Exclui os arquivos do celular após backup bem-sucedido.
     *
     * Android 11+ (API 30): usa [MediaStore.createDeleteRequest] — mostra diálogo do sistema
     *   pedindo confirmação, sem precisar de permissão extra.
     * Android 10 (API 29): tenta deleção direta; cada URI pode lançar RecoverableSecurityException,
     *   que relança um diálogo de confirmação por arquivo.
     * Android 9-: deleção direta via ContentResolver.
     */
    private fun deleteFiles(files: List<FileRef>) {
        if (files.isEmpty()) return
        val uris = files.mapNotNull { runCatching { Uri.parse(it.id) }.getOrNull() }
        if (uris.isEmpty()) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+: diálogo de confirmação para todos os arquivos de uma vez
            runCatching {
                val pendingIntent = MediaStore.createDeleteRequest(contentResolver, uris)
                pendingDeleteCount = files.size
                deleteLauncher.launch(
                    IntentSenderRequest.Builder(pendingIntent.intentSender).build()
                )
            }.onFailure {
                logic.notify("Não foi possível excluir os arquivos: ${it.message}")
            }
        } else {
            // Android 9-10: deleção direta
            var deleted = 0
            for (uri in uris) {
                if (runCatching { contentResolver.delete(uri, null, null) > 0 }.getOrDefault(false)) {
                    deleted++
                }
            }
            if (deleted > 0) logic.notifyDeletion(deleted)
            else logic.notify("Não foi possível excluir os arquivos do celular.")
        }
    }
}
