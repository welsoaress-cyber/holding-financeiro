import type { ReactNode } from 'react'
import { EntidadeContexto, type Entidade } from './contexto'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase/client'
import { useAuth } from '../auth/useAuth'
import { Carregando } from '../ui/Carregando'
import { Alerta } from '../ui/Alerta'
import { Botao } from '../ui/Botao'
import { mensagemDeErro } from '../erros/mensagemDeErro'

async function carregarEntidades(): Promise<Entidade[]> {
  const { data, error } = await supabase
    .from('entidade_membros')
    .select('papel, entidades ( id, nome )')
    .order('criado_em', { ascending: true })
  if (error) throw error
  return (data ?? []).flatMap((m) => {
    const e = m.entidades as unknown as { id: string; nome: string } | null
    return e ? [{ id: e.id, nome: e.nome, papel: m.papel as Entidade['papel'] }] : []
  })
}

/**
 * Carrega as entidades do usuário autenticado e fixa a entidade atual.
 * Toda consulta de módulo futuro deve usar `useEntidade().entidade.id`.
 */
export function EntidadeProvider({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth()
  const consulta = useQuery({
    queryKey: ['entidades', usuario?.id],
    queryFn: carregarEntidades,
    enabled: Boolean(usuario),
  })

  if (consulta.isPending) return <Carregando telaCheia texto="Carregando seus dados…" />

  if (consulta.isError) {
    return (
      <div className="mx-auto mt-16 max-w-lg space-y-4 p-6">
        <Alerta tipo="erro" titulo="Não foi possível carregar seus dados">{mensagemDeErro(consulta.error)}</Alerta>
        <div className="flex gap-2">
          <Botao onClick={() => consulta.refetch()}>Tentar novamente</Botao>
          <Botao variante="secundario" onClick={() => sair()}>Sair</Botao>
        </div>
      </div>
    )
  }

  const entidades = consulta.data
  if (entidades.length === 0) {
    return (
      <div className="mx-auto mt-16 max-w-lg space-y-4 p-6">
        <Alerta tipo="erro" titulo="Nenhuma entidade vinculada ao seu usuário">
          A entidade deveria ter sido criada automaticamente no cadastro. Entre em contato com o administrador.
        </Alerta>
        <Botao variante="secundario" onClick={() => sair()}>Sair</Botao>
      </div>
    )
  }

  return <EntidadeContexto.Provider value={{ entidade: entidades[0], entidades }}>{children}</EntidadeContexto.Provider>
}
