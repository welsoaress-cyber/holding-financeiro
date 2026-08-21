package br.com.appstom.ui

import androidx.compose.runtime.Composable

@Composable
actual fun AppBackHandler(enabled: Boolean, onBack: () -> Unit) {
    // iOS não tem botão Voltar do sistema — no-op intencional
}
