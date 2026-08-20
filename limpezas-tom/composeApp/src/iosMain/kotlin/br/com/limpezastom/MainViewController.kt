package br.com.limpezastom

import androidx.compose.ui.window.ComposeUIViewController
import br.com.limpezastom.logic.LogicHolder
import br.com.limpezastom.platform.PlatformContext
import platform.UIKit.UIViewController

/**
 * Ponto de entrada do iOS: hospeda a UI Compose compartilhada.
 * Chamado pelo iosApp (SwiftUI) via MainViewControllerKt.MainViewController().
 *
 * No iOS, o seletor de pasta usa UIDocumentPickerViewController (não disponível
 * via KMP ainda). Por isso, onPickFolder é um no-op com aviso ao usuário.
 */
fun MainViewController(): UIViewController {
    val logic = LogicHolder.get(PlatformContext())

    return ComposeUIViewController {
        br.com.limpezastom.ui.AppRoot(
            logic           = logic,
            onScanRequested = { logic.scan() },
            onPickFolder    = {
                logic.notify("No iOS, selecione a pasta pelo app Arquivos manualmente.")
            },
        )
    }
}
