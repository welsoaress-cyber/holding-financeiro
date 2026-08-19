package br.com.limpezastom

import androidx.compose.ui.window.ComposeUIViewController
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.model.UiState
import br.com.limpezastom.platform.PlatformContext
import platform.Photos.PHAsset
import platform.Photos.PHAssetChangeRequest
import platform.Photos.PHPhotoLibrary
import platform.UIKit.UIViewController

private const val ASSET_PREFIX = "phasset:"

/**
 * Ponto de entrada do iOS: hospeda a UI Compose compartilhada.
 * Chamado pelo iosApp (SwiftUI) via MainViewControllerKt.MainViewController().
 */
fun MainViewController(): UIViewController {
    val logic = LogicHolder.get(PlatformContext())

    return ComposeUIViewController {
        br.com.limpezastom.ui.AppRoot(
            logic = logic,
            onScanRequested = { logic.scan() },
            onBackupRequested = {
                // TODO iOS: integrar o Google Sign-In (GIDSignIn) e chamar
                // logic.startBackup(accessToken). Ver README, seção iOS.
                logic.notify(
                    "Login Google no iOS ainda não está configurado — " +
                        "veja o passo a passo no README do projeto."
                )
            },
            onDeleteBackedUp = { requestDeviceCleanup(logic) },
            onOpenDeepCleanSettings = { /* iOS é sandbox — não se aplica */ },
        )
    }
}

/**
 * Exclusão dos itens já salvos na nuvem: o PhotoKit mostra o diálogo de
 * confirmação do sistema antes de apagar qualquer coisa da galeria.
 */
private fun requestDeviceCleanup(logic: br.com.limpezastom.logic.AppLogic) {
    val summary = (logic.state.value as? UiState.Done)?.summary ?: return
    val ids = summary.deletable
        .filter { it.id.startsWith(ASSET_PREFIX) }
        .map { it.id.removePrefix(ASSET_PREFIX) }
    if (ids.isEmpty()) return

    PHPhotoLibrary.sharedPhotoLibrary().performChanges({
        val assets = PHAsset.fetchAssetsWithLocalIdentifiers(ids, null)
        PHAssetChangeRequest.deleteAssets(assets)
    }) { success, _ ->
        if (success) logic.onDeviceCleanupDone()
        else logic.notify("Exclusão cancelada — os arquivos continuam no celular.")
    }
}
