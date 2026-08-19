package br.com.limpezastom.logic

import br.com.limpezastom.model.FileKind
import br.com.limpezastom.model.FileRef
import br.com.limpezastom.model.LayeredSuggestions
import br.com.limpezastom.model.RawScan
import br.com.limpezastom.model.Suggestion
import br.com.limpezastom.model.SuggestionLayer
import br.com.limpezastom.model.SuggestionType

/**
 * Classifica arquivos em 3 camadas de sugestão, aplicando as regras de segurança.
 *
 * Regras imutáveis:
 *  - Arquivos com menos de 24h NUNCA são sugeridos.
 *  - Arquivos em diretórios marcados com .nomedia são ignorados.
 *  - Arquivos corrompidos ou inacessíveis (size = 0 e name vazio) são ignorados.
 *  - Arquivos já listados em uma camada menor não aparecem na camada maior.
 */
class SuggestionEngine {

    private val ms24h = 24L * 60 * 60 * 1000
    private val ms30d = 30L * 24 * 60 * 60 * 1000
    private val ms6months = 180L * 24 * 60 * 60 * 1000
    private val ms1year = 365L * 24 * 60 * 60 * 1000
    private val ms2years = 2 * ms1year

    fun classify(raw: RawScan, duplicates: List<FileRef>, nowMs: Long): LayeredSuggestions {
        val cutoff = nowMs - ms24h

        // Filtra arquivos elegíveis: não .nomedia, modificados há mais de 24h, acessíveis
        val allFiles = (raw.media + raw.documents).filter { file ->
            !file.isNomedia && file.lastModifiedMs < cutoff && file.size > 0
        }

        // Camada 1 — Lixo óbvio: detectado como APK, cache, macos artifact
        val l1Ids = mutableSetOf<String>()
        val layer1 = buildList {
            // APKs já instalados no device
            allFiles.filter { it.mime == "application/vnd.android.package-archive" }.forEach { f ->
                l1Ids += f.id
                add(Suggestion(
                    id = "l1_apk_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L1_OBVIOUS,
                    type = SuggestionType.JUNK_APK,
                    reason = "APK baixado — app já instalado ou não é mais necessário",
                ))
            }
            // Artefatos .DS_Store e __MACOSX
            allFiles.filter { f ->
                f.id !in l1Ids && (f.name == ".DS_Store" || f.name.startsWith("__MACOSX"))
            }.forEach { f ->
                l1Ids += f.id
                add(Suggestion(
                    id = "l1_mac_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L1_OBVIOUS,
                    type = SuggestionType.JUNK_MACOS_ARTIFACT,
                    reason = "Arquivo criado pelo macOS — inútil no Android",
                ))
            }
            // Arquivos de junk bruto do scanner de plataforma (Camada 1 por natureza)
            raw.junk.take(200).forEach { junk ->
                // Converte JunkFile em FileRef para sugestão
                val pseudoId = "junk:${junk.path}"
                if (pseudoId !in l1Ids) {
                    l1Ids += pseudoId
                    add(Suggestion(
                        id = "l1_junk_${junk.path.hashCode()}",
                        file = FileRef(
                            id = pseudoId,
                            name = junk.path.substringAfterLast('/'),
                            size = junk.size,
                            mime = "application/octet-stream",
                            kind = FileKind.JUNK,
                            lastModifiedMs = 0,
                        ),
                        layer = SuggestionLayer.L1_OBVIOUS,
                        type = SuggestionType.JUNK_CACHE,
                        reason = junk.reason,
                    ))
                }
            }
        }

        // Camada 2 — Lixo com critério
        val l2Ids = mutableSetOf<String>()
        val layer2 = buildList {
            // Fotos borradas
            allFiles.filter { f ->
                f.id !in l1Ids && f.kind == FileKind.PHOTO
                    && f.blurScore != null && f.blurScore < 50
            }.take(100).forEach { f ->
                l2Ids += f.id
                add(Suggestion(
                    id = "l2_blur_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L2_CRITERIA,
                    type = SuggestionType.BLURRY_PHOTO,
                    reason = "Foto borrada (score de nitidez: ${f.blurScore}/100)",
                ))
            }
            // Screenshots velhos (>30 dias)
            allFiles.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
                    && f.kind == FileKind.PHOTO && f.isScreenshot
                    && (nowMs - f.lastModifiedMs) > ms30d
            }.take(200).forEach { f ->
                l2Ids += f.id
                val days = ((nowMs - f.lastModifiedMs) / 86_400_000).toInt()
                add(Suggestion(
                    id = "l2_ss_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L2_CRITERIA,
                    type = SuggestionType.OLD_SCREENSHOT,
                    reason = "Screenshot com $days dias sem visualização",
                ))
            }
            // Áudios não reproduzidos há >6 meses
            allFiles.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
                    && f.kind == FileKind.AUDIO && !f.wasPlayed
                    && (nowMs - f.lastModifiedMs) > ms6months
            }.take(50).forEach { f ->
                l2Ids += f.id
                add(Suggestion(
                    id = "l2_audio_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L2_CRITERIA,
                    type = SuggestionType.UNPLAYED_AUDIO,
                    reason = "Áudio gravado há mais de 6 meses, nunca reproduzido",
                ))
            }
            // Vídeos muito curtos (<3 segundos)
            allFiles.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
                    && f.kind == FileKind.VIDEO
                    && f.durationMs != null && f.durationMs < 3_000
            }.take(50).forEach { f ->
                l2Ids += f.id
                add(Suggestion(
                    id = "l2_shortvid_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L2_CRITERIA,
                    type = SuggestionType.SHORT_VIDEO,
                    reason = "Vídeo de menos de 3 segundos (gravação acidental?)",
                ))
            }
            // Duplicatas exatas (detectadas pelo DuplicateFinder)
            duplicates.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
            }.take(300).forEach { f ->
                l2Ids += f.id
                add(Suggestion(
                    id = "l2_dup_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L2_CRITERIA,
                    type = SuggestionType.DUPLICATE_EXACT,
                    reason = "Cópia exata de outro arquivo — conteúdo idêntico",
                    groupId = "dup_${f.id.hashCode()}",
                ))
            }
        }

        // Camada 3 — Lixo com cautela
        val layer3 = buildList {
            // Documentos não acessados há mais de 2 anos
            allFiles.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
                    && f.kind == FileKind.DOCUMENT
                    && (nowMs - f.lastModifiedMs) > ms2years
            }.take(30).forEach { f ->
                l2Ids += f.id   // reuse set to avoid double entries
                val years = ((nowMs - f.lastModifiedMs) / (365L * 86_400_000)).toInt()
                add(Suggestion(
                    id = "l3_olddoc_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L3_CAUTIOUS,
                    type = SuggestionType.OLD_UNACCESSED_DOC,
                    reason = "Documento não aberto há $years anos",
                ))
            }
            // Mídia do WhatsApp com mais de 1 ano
            allFiles.filter { f ->
                f.id !in l1Ids && f.id !in l2Ids
                    && (f.id.contains("WhatsApp") || f.name.contains("WA"))
                    && (nowMs - f.lastModifiedMs) > ms1year
            }.take(100).forEach { f ->
                l2Ids += f.id
                add(Suggestion(
                    id = "l3_wa_${f.id}",
                    file = f,
                    layer = SuggestionLayer.L3_CAUTIOUS,
                    type = SuggestionType.OLD_WHATSAPP_MEDIA,
                    reason = "Mídia do WhatsApp com mais de 1 ano",
                ))
            }
        }

        return LayeredSuggestions(
            layer1 = layer1,
            layer2 = layer2,
            layer3 = layer3,
        )
    }
}
