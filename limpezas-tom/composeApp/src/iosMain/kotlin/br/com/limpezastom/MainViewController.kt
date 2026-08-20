package br.com.limpezastom

import androidx.compose.ui.window.ComposeUIViewController
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.platform.PlatformContext
import platform.UIKit.UIViewController

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
            onOpenGooglePhotos = {
                // iOS: o usuário pode abrir o app Fotos nativo para ver o backup do iCloud.
                // Deep-link para o app Fotos não é suportado via URL scheme oficial no iOS.
                logic.notify("Use o app Fotos ou Google Fotos para fazer o backup no iOS.")
            },
            onOpenGoogleDrive = {
                // iOS: Google Drive tem URL scheme "googledrive://" mas não é garantido.
                logic.notify("Abra o app Google Drive para salvar documentos na nuvem.")
            },
            onOpenDeepCleanSettings = { /* iOS é sandbox — não se aplica */ },
        )
    }
}
