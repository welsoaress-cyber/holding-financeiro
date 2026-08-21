package br.com.appstom.ui

import androidx.compose.runtime.Composable

/**
 * Captura o botão/gesto "voltar" do sistema.
 * Android: intercepta o botão Voltar e o gesto de deslizar para o lado.
 * iOS: no-op (iOS não tem botão Voltar do sistema).
 */
@Composable
expect fun AppBackHandler(enabled: Boolean = true, onBack: () -> Unit)
