package br.com.appstom.backup

import br.com.appstom.model.FileRef

/**
 * Destino de backup: recebe uma lista de arquivos, cria uma pasta com
 * nome baseado na data/hora atual e copia os arquivos para ela.
 * Retorna o nome da pasta criada.
 *
 * Android: implementado em DriveFolder via Storage Access Framework.
 * iOS: stub — não disponível.
 */
interface BackupSink {
    suspend fun backup(
        files: List<FileRef>,
        onProgress: (done: Int, total: Int, currentName: String) -> Unit,
    ): String
}
