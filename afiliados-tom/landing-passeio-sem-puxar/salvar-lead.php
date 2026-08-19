<?php
// ── CONFIGURAÇÕES ────────────────────────────────────────────────
$EMAIL_NOTIFICACAO = 'welsoaress@gmail.com';   // seu e-mail para receber alerta de lead
$ARQUIVO_CSV       = __DIR__ . '/leads.csv';    // onde os leads ficam salvos
$REDIRECT_SUCESSO  = 'obrigado.html';
$REDIRECT_ERRO     = 'index.html';
// ────────────────────────────────────────────────────────────────

// Bloqueia acesso direto sem POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $REDIRECT_ERRO);
    exit;
}

// Anti-bot: honeypot (campo "website" deve estar vazio)
if (!empty($_POST['website'])) {
    header('Location: ' . $REDIRECT_SUCESSO); // finge que salvou
    exit;
}

// Sanitiza entradas
$nome     = trim(strip_tags($_POST['nome']     ?? ''));
$whatsapp = trim(strip_tags($_POST['whatsapp'] ?? ''));
$produto  = trim(strip_tags($_POST['produto']  ?? 'Passeio Sem Puxar'));
$ip       = $_SERVER['REMOTE_ADDR'] ?? '';
$data     = date('d/m/Y H:i:s');

// Validação mínima
if (empty($nome) || strlen($whatsapp) < 8) {
    header('Location: ' . $REDIRECT_ERRO . '?erro=campos');
    exit;
}

// ── SALVAR NO CSV ────────────────────────────────────────────────
$nova_linha = implode(';', [
    $data,
    $nome,
    $whatsapp,
    $produto,
    $ip,
]) . "\n";

// Cria o arquivo com cabeçalho se ainda não existir
if (!file_exists($ARQUIVO_CSV)) {
    file_put_contents($ARQUIVO_CSV, "Data;Nome;WhatsApp;Produto;IP\n");
}
file_put_contents($ARQUIVO_CSV, $nova_linha, FILE_APPEND | LOCK_EX);

// ── NOTIFICAÇÃO POR E-MAIL ───────────────────────────────────────
$assunto = "🐾 Novo lead — $produto";
$mensagem = "Novo lead capturado!\n\n"
          . "Data:      $data\n"
          . "Nome:      $nome\n"
          . "WhatsApp:  $whatsapp\n"
          . "Produto:   $produto\n";

$headers = "From: leads@passeiosempuxar.com.br\r\n"
         . "Reply-To: $EMAIL_NOTIFICACAO\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($EMAIL_NOTIFICACAO, $assunto, $mensagem, $headers);

// ── REDIRECIONA PARA OBRIGADO ─────────────────────────────────────
header('Location: ' . $REDIRECT_SUCESSO);
exit;
