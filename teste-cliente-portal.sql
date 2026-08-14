-- ================================================================
-- CLIENTE DE TESTE — PORTAL SERVNET
-- Execute no Supabase Dashboard > SQL Editor
-- ================================================================

-- Insere um cliente fictício para testar o portal
-- Usa o mesmo user_id e planoId dos planos já cadastrados no sistema

INSERT INTO public.cli_clientes (user_id, dados)
SELECT
  p.user_id,
  jsonb_build_object(
    'nome',           'Maria da Silva Teste',
    'cpfCnpj',        '123.456.789-09',
    'dataNascimento', '1985-03-20',
    'email',          'maria.teste@servnet.com.br',
    'telefone',       '(11) 98765-4321',
    'diaVencimento',  '10',
    'status',         'Ativo',
    'contratos', jsonb_build_array(
      jsonb_build_object(
        'id',           gen_random_uuid()::text,
        'negocio',      'Servnet',
        'planoId',      p.id::text,
        'status',       'Ativo',
        'dataContrato', '2024-01-15'
      )
    )
  )
FROM public.cli_planos p
LIMIT 1
RETURNING id, dados->>'nome' AS nome, dados->>'cpfCnpj' AS cpf;

-- ================================================================
-- DADOS PARA FAZER LOGIN NO PORTAL:
--   CPF:            123.456.789-09
--   Data nascimento: 20/03/1985  (ou 1985-03-20)
-- ================================================================
