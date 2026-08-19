# 🧹 Limpezas Tom

App Android que faz uma **faxina completa no celular**:

1. **📸 Fotos e vídeos → Google Fotos** — envia tudo para a nuvem
2. **📄 Documentos → Google Drive** — PDFs, Word, planilhas etc. vão para a pasta "Limpezas Tom" no Drive
3. **🗑️ Sujeira → lixo** — apaga temporários, caches, arquivos vazios, sobras de apps
4. **👯 Duplicados** — detecta cópias repetidas de fotos (mesmo conteúdo) e sugere apagar
5. **🧹 Liberar espaço** — depois que tudo está seguro na nuvem, oferece apagar do celular (com confirmação do sistema)

## Como funciona (fluxo do app)

```
Analisar celular → Resultado (fotos/docs/sujeira/duplicados)
      → Conectar conta Google (consentimento)
      → Backup (Fotos → Google Fotos, Docs → Drive)
      → Limpeza da sujeira
      → "Liberar X GB do celular?" (exclusão com confirmação do Android)
```

## Tecnologia

- **Kotlin + Jetpack Compose** (Material 3), single-activity
- **Play Services AuthorizationClient** para OAuth (sem bibliotecas pesadas)
- **OkHttp** direto nas APIs REST:
  - Google Photos Library API (`/v1/uploads` + `mediaItems:batchCreate`, escopo `photoslibrary.appendonly`)
  - Google Drive API v3 (upload multipart, escopo `drive.file` — o app só enxerga o que ele mesmo criou)
- **MediaStore** para varrer fotos/vídeos/documentos
- Exclusão segura via `MediaStore.createDeleteRequest` (o Android pede confirmação ao usuário)

## Como compilar

1. Abra a pasta `limpezas-tom/` no **Android Studio** (Hedgehog ou mais novo)
2. Aguarde o Gradle sincronizar
3. `Run ▶` num aparelho Android 8+ (API 26+)

Ou por linha de comando: `./gradlew assembleDebug`

## ⚠️ Configuração obrigatória no Google Cloud (uma vez só)

Sem isso o botão de backup não funciona — o Google exige que o app seja registrado:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto (ex.: "Limpezas Tom")
2. Em **APIs e serviços → Biblioteca**, ative:
   - **Photos Library API**
   - **Google Drive API**
3. Em **APIs e serviços → Tela de consentimento OAuth**: configure como *Externo*, adicione seu e-mail como usuário de teste
4. Em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Android**
   - Nome do pacote: `br.com.limpezastom`
   - SHA-1: pegue com `./gradlew signingReport` (use o do build `debug`)

Não precisa colocar nenhuma chave no código — o Android identifica o app pelo pacote + SHA-1.

## Notas importantes

- **Google Fotos**: desde 2025 a API só permite que apps **enviem** mídia (escopo `appendonly`) — exatamente o que precisamos. Os uploads via API contam no armazenamento da conta Google.
- **Acesso total a arquivos**: a limpeza profunda de sujeira (fora das pastas de mídia) pede a permissão "Acesso a todos os arquivos", concedida manualmente pelo usuário. Sem ela, o app limpa só os caches próprios e o que está visível.
- **Versão 0.1**: o backup roda com o app aberto em primeiro plano. Próximo passo natural: mover para `WorkManager` com notificação, para rodar em segundo plano.

## Estrutura

```
app/src/main/java/br/com/limpezastom/
├── MainActivity.kt          # permissões, consentimento Google, diálogo de exclusão
├── AppViewModel.kt          # orquestra: análise → backup → limpeza
├── model/Models.kt          # tipos (ScanReport, BackupSummary, UiState…)
├── scan/DeviceScanner.kt    # varredura: mídia, docs, sujeira, duplicados (hash)
├── cloud/GoogleAuth.kt      # OAuth via Play Services
├── cloud/PhotosUploader.kt  # upload p/ Google Fotos
├── cloud/DriveUploader.kt   # upload p/ Drive (pasta "Limpezas Tom")
└── ui/Screens.kt            # telas Compose (análise, resultado, progresso, resumo)
```

## Roadmap

- [ ] Backup em segundo plano (WorkManager + notificação de progresso)
- [ ] Seleção manual do que enviar/apagar
- [ ] Agendamento de faxina automática (ex.: toda semana)
- [ ] Ícone e identidade visual próprios
- [ ] Publicação na Play Store (exige justificativa para "Acesso a todos os arquivos")
