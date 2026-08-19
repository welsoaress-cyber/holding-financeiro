# 🧹 Limpezas Tom

App **Android + iOS** (Kotlin Multiplatform + Compose Multiplatform), básico e
extremamente funcional, que organiza de verdade a bagunça acumulada ao longo
dos anos no celular:

1. **📸 Fotos e vídeos → Google Fotos** — envia tudo para a nuvem
2. **📄 Documentos → Google Drive** — organizados automaticamente por **tipo e ano**:
   `Limpezas Tom/Planilhas/2023/orcamento.xlsx`, `Limpezas Tom/PDFs/2021/contrato.pdf`…
3. **🗑️ Sujeira** — encontra temporários, caches, arquivos vazios, sobras de apps
4. **👯 Duplicados** — detecta cópias repetidas de fotos (pelo conteúdo, não pelo nome)
5. **🧹 Liberar espaço** — depois que tudo está seguro na nuvem, oferece apagar do celular

## 🔒 Regra de ouro: nada é apagado sem você aprovar

O app **nunca exclui nada sozinho**. Toda exclusão passa por dupla proteção:

- **Sujeira**: tela de revisão onde os grupos começam **desmarcados** — você vê
  cada arquivo (caminho completo e tamanho), marca só o que pode ir embora e confirma
- **Fotos/documentos já enviados**: só saem do aparelho pelo **diálogo oficial do
  sistema** (Android e iOS), que mostra a lista e pede sua confirmação
- O backup em si **só envia** arquivos — não altera nem apaga nada
- Arquivos de sistema (como `.nomedia`) nunca entram na lista de sujeira

## 🏗️ Arquitetura multiplataforma

Um único código para os dois sistemas — só o que é obrigatoriamente nativo é separado:

```
limpezas-tom/
├── composeApp/
│   └── src/
│       ├── commonMain/   # COMPARTILHADO Android + iOS
│       │   ├── model/            # tipos (FileRef, ScanReport, UiState…)
│       │   ├── logic/            # AppLogic (análise → backup → limpeza) + duplicados
│       │   ├── cloud/            # Google Fotos + Drive via Ktor (REST puro)
│       │   ├── ui/               # todas as telas (Compose Multiplatform)
│       │   └── platform/         # contratos expect (scanner, leitura de arquivos)
│       ├── androidMain/  # SÓ ANDROID
│       │   ├── MainActivity, permissões, login Google (Play Services)
│       │   └── scanner MediaStore + exclusão via createDeleteRequest
│       └── iosMain/      # SÓ iOS
│           ├── MainViewController (hospeda a UI Compose)
│           └── scanner PhotoKit + exclusão via PHAssetChangeRequest
└── iosApp/               # projeto Xcode (SwiftUI, gerado com XcodeGen)
```

## Status por plataforma

| Funcionalidade | Android | iOS |
| --- | --- | --- |
| Análise de fotos/vídeos | ✅ MediaStore | ✅ PhotoKit |
| Documentos | ✅ MediaStore | — (iOS não expõe arquivos de outros apps) |
| Sujeira | ✅ caches + acesso total opcional | ✅ caches do app (sandbox) |
| Duplicados por conteúdo | ✅ | ✅ (código comum) |
| Upload Google Fotos/Drive | ✅ | ✅ (código comum — falta só o login) |
| Login Google | ✅ Play Services | 🔜 GIDSignIn (TODO marcado no código) |
| Liberar espaço com confirmação | ✅ diálogo do Android | ✅ diálogo do iOS |

## Como compilar

### Android
1. Abra a pasta `limpezas-tom/` no **Android Studio** e rode o app (`composeApp`)
2. Ou: `./gradlew :composeApp:assembleDebug`

### iOS (precisa de um Mac com Xcode)
1. `brew install xcodegen`
2. `cd iosApp && xcodegen generate`
3. Abra `LimpezasTom.xcodeproj` no Xcode e rode — o Xcode compila o código
   Kotlin automaticamente (script `embedAndSignAppleFrameworkForXcode`)

## ⚠️ Configuração obrigatória no Google Cloud (uma vez só)

Sem isso o botão de backup não funciona — o Google exige que o app seja registrado:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com) e crie um projeto (ex.: "Limpezas Tom")
2. Em **APIs e serviços → Biblioteca**, ative **Photos Library API** e **Google Drive API**
3. Em **Tela de consentimento OAuth**: configure como *Externo* e adicione seu e-mail como usuário de teste
4. Em **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - **Android**: pacote `br.com.limpezastom` + SHA-1 (`./gradlew signingReport`, build `debug`)
   - **iOS**: bundle id `br.com.limpezastom.LimpezasTom` (necessário quando for integrar o GIDSignIn)

No Android não é preciso colocar nenhuma chave no código — o sistema identifica
o app pelo pacote + SHA-1.

## Notas importantes

- **Google Fotos**: desde 2025 a API só permite que apps **enviem** mídia (escopo
  `appendonly`) — exatamente o que precisamos. Uploads contam no armazenamento da conta.
- **Acesso total a arquivos (Android)**: a limpeza profunda pede a permissão
  "Acesso a todos os arquivos", concedida manualmente. Sem ela, o app limpa só o visível.
- **Versão 0.2**: o backup roda com o app aberto em primeiro plano.
- **iOS**: o código nativo (PhotoKit) foi escrito mas ainda não foi compilado num
  Mac — ajustes pequenos podem ser necessários no primeiro build.

## Roadmap

- [ ] Login Google no iOS (GIDSignIn) — único bloqueio para o backup no iPhone
- [ ] Backup em segundo plano (WorkManager no Android / BGTaskScheduler no iOS)
- [ ] Seleção manual do que enviar/apagar
- [ ] Agendamento de faxina automática (ex.: toda semana)
- [ ] Ícone e identidade visual próprios
- [ ] Publicação (Play Store exige justificativa para "Acesso a todos os arquivos")
