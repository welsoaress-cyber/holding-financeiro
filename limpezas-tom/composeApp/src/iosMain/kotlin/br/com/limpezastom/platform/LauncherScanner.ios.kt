package br.com.limpezastom.platform

import br.com.limpezastom.model.DuplicateShortcutGroup

/**
 * Implementação iOS do scanner de atalhos da tela inicial.
 *
 * O iOS não expõe API para gerenciar ícones na tela inicial de terceiros.
 * Este módulo retorna lista vazia — a UI detecta isso e exibe card desabilitado
 * com mensagem "Disponível apenas no Android".
 */
actual class LauncherScanner actual constructor(context: PlatformContext) {

    actual fun findDuplicateShortcuts(): List<DuplicateShortcutGroup> = emptyList()

    actual fun disablePinnedShortcuts(packageName: String, shortcutIds: List<String>) {
        // Não disponível no iOS
    }
}
