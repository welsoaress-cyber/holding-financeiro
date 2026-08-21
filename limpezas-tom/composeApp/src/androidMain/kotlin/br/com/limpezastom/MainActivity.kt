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
import br.com.limpezastom.backup.DriveApiBackup
import br.com.limpezastom.logic.AppLogic
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.ui.AppRoot
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.Scope

class MainActivity : ComponentActivity() {

    private val logic: AppLogic by lazy { LogicHolder.get(applicationContext) }

    /** Escopo OAuth para criar/ler arquivos criados pelo app no Drive do usuário. */
    private val driveScope = Scope("https://www.googleapis.com/auth/drive.file")

    /**
     * Arquivos aguardando autorização OAuth antes do backup.
     * Preenchido em [authorizeAndBackup]; consumido em [onDriveAuthorized].
     */
    private var pendingDriveFiles: List<FileRef> = emptyList()

    /**
     * Quantidade de arquivos aguardando confirmação do sistema para exclusão.
     * Salvo antes de lançar o diálogo do Android 11+ para poder notificar o logic.
     */
    private var pendingDeleteCount: Int = 0

    // ── Permissões de leitura de imagens ─────────────────────────────────────

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        if (grants.values.any { it }) logic.scan()
        else logic.notify("Sem permissão de leitura de fotos. Não é possível listar screenshots.")
    }

    // ── Autorização OAuth para o Google Drive ─────────────────────────────────

    /**
     * Resultado do diálogo de consentimento OAuth (exibido apenas na 1ª vez).
     * Nas vezes seguintes, [Identity.getAuthorizationClient().authorize()] devolve
     * o token sem precisar do diálogo.
     */
    private val driveAuthLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && result.data != null) {
            runCatching {
                val authResult = Identity.getAuthorizationClient(this)
                    .getAuthorizationResultFromIntent(result.data!!)
                val token = authResult.accessToken
                if (!token.isNullOrBlank()) {
                    onDriveAuthorized(token)
                    return@runCatching
                }
            }
        }
        pendingDriveFiles = emptyList()
        logic.notify("Autorização do Drive cancelada ou falhou. Tente de novo.")
    }

    // ── Exclusão de arquivos do celular ───────────────────────────────────────

    /**
     * Diálogo do sistema (Android 11+) para confirmar exclusão em lote.
     * [RESULT_OK] = usuário confirmou.
     */
    private val deleteLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        val count = pendingDeleteCount
        pendingDeleteCount = 0
        if (result.resultCode == RESULT_OK && count > 0) {
            logic.notifyDeletion(count)
        }
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AppRoot(
                logic                  = logic,
                onScanRequested        = ::scanWithPermissions,
                onPickFolder           = { authorizeAndBackup(emptyList()) },
                onPickFolderThenBackup = { files -> authorizeAndBackup(files) },
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

    // ── Drive OAuth ───────────────────────────────────────────────────────────

    /**
     * Solicita autorização OAuth para o Drive e, em seguida:
     * - [files] vazio → apenas marca o Drive como pronto ([logic.onSinkReady()])
     * - [files] não vazio → inicia o backup imediatamente após autorização
     *
     * Se o usuário já autorizou na sessão atual, o token chega sem diálogo.
     * Na 1ª vez (ou após revogar acesso), aparece o diálogo de consentimento do Google.
     *
     * IMPORTANTE: para funcionar, o app deve estar cadastrado no Google Cloud Console:
     *   1. https://console.cloud.google.com  → criar projeto
     *   2. APIs e serviços → Ativar Google Drive API
     *   3. Credenciais → Criar credencial → ID do cliente OAuth → Android
     *      Package: br.com.limpezastom
     *      SHA-1: hash do certificado de assinatura do APK
     */
    private fun authorizeAndBackup(files: List<FileRef>) {
        pendingDriveFiles = files

        val request = AuthorizationRequest.Builder()
            .setRequestedScopes(listOf(driveScope))
            .build()

        Identity.getAuthorizationClient(this)
            .authorize(request)
            .addOnSuccessListener { result ->
                val token = result.accessToken
                if (!token.isNullOrBlank() && !result.hasResolution()) {
                    // Já autorizado — token disponível imediatamente
                    onDriveAuthorized(token)
                } else if (result.hasResolution()) {
                    // Precisa de consentimento do usuário (1ª vez)
                    runCatching {
                        driveAuthLauncher.launch(
                            IntentSenderRequest.Builder(result.pendingIntent!!.intentSender).build()
                        )
                    }.onFailure {
                        pendingDriveFiles = emptyList()
                        logic.notify("Não foi possível abrir o login do Google.")
                    }
                } else {
                    pendingDriveFiles = emptyList()
                    logic.notify("Não foi possível obter autorização do Drive.")
                }
            }
            .addOnFailureListener { e ->
                pendingDriveFiles = emptyList()
                // Causa mais comum: app não cadastrado no Google Cloud Console
                val msg = if (e.message?.contains("ApiException") == true ||
                    e.message?.contains("DEVELOPER_ERROR") == true
                ) {
                    "Configuração do Google Drive pendente. Entre em contato com o desenvolvedor."
                } else {
                    "Erro ao conectar ao Drive: ${e.message}"
                }
                logic.notify(msg)
            }
    }

    /**
     * Chamado quando o token OAuth está disponível (imediatamente ou após diálogo).
     * Cria o [DriveApiBackup] e inicia o fluxo de backup (ou apenas marca como pronto).
     */
    private fun onDriveAuthorized(token: String) {
        val sink = DriveApiBackup(this, token)
        logic.backupSink = sink

        val files = pendingDriveFiles
        pendingDriveFiles = emptyList()

        if (files.isNotEmpty()) {
            logic.startBackup(files)
        } else {
            logic.onSinkReady()
        }
    }

    // ── Permissões de mídia ───────────────────────────────────────────────────

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

    // ── Exclusão de arquivos do celular ───────────────────────────────────────

    /**
     * Exclui os arquivos originais do celular após backup bem-sucedido.
     *
     * Android 11+ (API 30): [MediaStore.createDeleteRequest] — diálogo oficial do sistema,
     *   permite excluir qualquer arquivo de mídia sem permissão extra.
     * Android 10- (API 29-): [ContentResolver.delete] direto (funciona para arquivos
     *   que o app leu via permissão READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE).
     */
    private fun deleteFiles(files: List<FileRef>) {
        if (files.isEmpty()) return
        val uris = files.mapNotNull { runCatching { Uri.parse(it.id) }.getOrNull() }
        if (uris.isEmpty()) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            runCatching {
                val pending = MediaStore.createDeleteRequest(contentResolver, uris)
                pendingDeleteCount = files.size
                deleteLauncher.launch(
                    IntentSenderRequest.Builder(pending.intentSender).build()
                )
            }.onFailure {
                logic.notify("Não foi possível excluir: ${it.message}")
            }
        } else {
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
