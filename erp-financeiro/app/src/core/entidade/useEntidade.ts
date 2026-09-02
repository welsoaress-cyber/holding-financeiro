import { useContext } from 'react'
import { EntidadeContexto } from './contexto'

export function useEntidade(): EntidadeContexto {
  const ctx = useContext(EntidadeContexto)
  if (!ctx) throw new Error('useEntidade precisa estar dentro de EntidadeProvider')
  return ctx
}
