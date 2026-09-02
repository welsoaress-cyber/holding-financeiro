import { createContext } from 'react'

export interface Entidade {
  id: string
  nome: string
  papel: 'proprietario' | 'membro'
}

export interface EntidadeContexto {
  entidade: Entidade
  entidades: Entidade[]
}

export const EntidadeContexto = createContext<EntidadeContexto | null>(null)
