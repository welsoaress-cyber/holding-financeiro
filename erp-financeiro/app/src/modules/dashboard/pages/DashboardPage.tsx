import { CabecalhoPagina } from '../../../core/ui/CabecalhoPagina'
import { Cartao } from '../../../core/ui/Cartao'
import { useEntidade } from '../../../core/entidade/useEntidade'

export function DashboardPage() {
  const { entidade } = useEntidade()
  return (
    <>
      <CabecalhoPagina titulo="Dashboard" descricao={`Visão geral de ${entidade.nome}`} />
      <Cartao className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium">Fundação concluída</p>
        <p className="text-sm text-ink-muted">Os indicadores financeiros serão exibidos aqui a partir da Etapa 6.</p>
      </Cartao>
    </>
  )
}
