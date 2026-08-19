package br.com.limpezastom.cloud

import android.app.Activity
import android.content.Intent
import androidx.activity.result.IntentSenderRequest
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.Scope

/**
 * Autorização Google via Play Services (AuthorizationClient).
 * Escopos: enviar mídia ao Google Fotos e criar arquivos no Drive.
 */
object GoogleAuth {

    private val SCOPES = listOf(
        Scope("https://www.googleapis.com/auth/photoslibrary.appendonly"),
        Scope("https://www.googleapis.com/auth/drive.file"),
    )

    fun requestAuthorization(
        activity: Activity,
        onToken: (String) -> Unit,
        onResolutionNeeded: (IntentSenderRequest) -> Unit,
        onError: (Exception) -> Unit,
    ) {
        val request = AuthorizationRequest.builder()
            .setRequestedScopes(SCOPES)
            .build()
        Identity.getAuthorizationClient(activity)
            .authorize(request)
            .addOnSuccessListener { result ->
                val pendingIntent = result.pendingIntent
                when {
                    result.hasResolution() && pendingIntent != null ->
                        onResolutionNeeded(
                            IntentSenderRequest.Builder(pendingIntent.intentSender).build()
                        )
                    result.accessToken != null -> onToken(result.accessToken!!)
                    else -> onError(IllegalStateException("Autorização sem token de acesso"))
                }
            }
            .addOnFailureListener { onError(it) }
    }

    /** Extrai o token após o usuário confirmar a tela de consentimento. */
    fun tokenFromResult(activity: Activity, data: Intent?): String? = runCatching {
        Identity.getAuthorizationClient(activity)
            .getAuthorizationResultFromIntent(data)
            .accessToken
    }.getOrNull()
}
