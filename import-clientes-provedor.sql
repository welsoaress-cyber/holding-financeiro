-- ================================================================
-- Importação em massa: 92 clientes Provedor (CSV ServNet)
-- receberLembretes: false  |  contratos: [Provedor]
-- Execute no Supabase SQL Editor
-- ================================================================

DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'welsoaress@gmail.com' LIMIT 1;
  IF v_uid IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ADRIELE BISPO DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 224, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "427.592.868-78", "telefone": "11959319242", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '427.592.868-78' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALEX DE LIMA CASTRO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "383.034.528-35", "telefone": "11962879477", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '383.034.528-35' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALEXANDRE GONçALVES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "173.098.358-83", "telefone": "11972949314", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '173.098.358-83' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALINE DA SILVA OLIVEIRA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "25", "dataContrato": "2026-06-13", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 75-A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "443.363.808-05", "telefone": "11947199209", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA LIDIANE"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '443.363.808-05' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALINE SANTOS NUNES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 43, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "457.013.038-02", "telefone": "11969661906", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA TEOFANES", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '457.013.038-02' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALTEMAR LUIZ SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "103.826.968-75", "telefone": "11965186619", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '103.826.968-75' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ALVARO PONCIANO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-04-22", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 51, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "343.261.788-76", "telefone": "11965207168", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '343.261.788-76' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ANA CLEIDE SANTOS ALMEIDA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "032.487.545-24", "telefone": "11965153686", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '032.487.545-24' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ANA PAULA DE SOUZA ERNANDES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-02-09", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "189.758.998-02", "telefone": "11959667657", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '189.758.998-02' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ANA PAULA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "15", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 61, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "232.299.308-51", "telefone": "11946055130", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '232.299.308-51' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ANTONIO CARLOS PEREIRA DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2026-07-03", "enderecoInstalacao": "RUA ANTROPOLOGIA, 52, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "098.728.894-65", "telefone": "11986078458", "cep": "04855-370", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '098.728.894-65' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "BARBARA CRISTINA RODRIGUES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2026-01-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "482.212.178-08", "telefone": "11974540177", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '482.212.178-08' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "BRUNA MONIQUE DE JESUS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Bloqueado", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 153, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "432.420.898-04", "telefone": "11994766637", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '432.420.898-04' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "BRUNO DUARTE", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 57 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "394.536.978-93", "telefone": "11946055130", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '394.536.978-93' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "BRUNO LOURENçO DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "452.555.518-13", "telefone": "11947188898", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '452.555.518-13' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "BRUNO SILVA PIRES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-12-19", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 52E, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "411.949.478-08", "telefone": "11952710956", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA TEOFANES"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '411.949.478-08' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CARLA DE JESUS SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-12-19", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 55, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "470.147.648-02", "telefone": "11987809375", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA TEOFANES"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '470.147.648-02' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CINTIA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 61, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "381.625.828-00", "telefone": "11951045566", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '381.625.828-00' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CINTIA LIMA DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 40, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "394.177.098-52", "telefone": "11976997930", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '394.177.098-52' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CLAUDECI VIEIRA DA ROCHA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "26", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 89, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "446.189.809-15", "telefone": "11949081524", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '446.189.809-15' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CLAUDENICE SANTOS DE ARAUJO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-11-09", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "711.406.244-31", "telefone": "11964657736", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '711.406.244-31' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CLAUDIO ALEXANDRE SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-12-19", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 101, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "412.567.268-77", "telefone": "11995685678", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '412.567.268-77' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "CRISTIANE GOMES DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "353.651.388-30", "telefone": "11968102943", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '353.651.388-30' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "DANIELA DE JESUS SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "420.143.558-00", "telefone": "11981739426", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '420.143.558-00' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "DANIELE SOUZA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-12-30", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 282, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "544.568.618-35", "telefone": "11960628989", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '544.568.618-35' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "DENISE AMORIM DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2026-01-10", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 101, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "70Mb"}], "cpf": "448.207.888-33", "telefone": "11949731700", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "CASA-03"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '448.207.888-33' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "EDITE DE LIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "288.820.258-10", "telefone": "11967803604", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "COMéRCIO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '288.820.258-10' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "EDIVANIA LIMA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-30", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 26, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": ""}], "cpf": "312.699.248-00", "telefone": "11983798072", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "ESCADAO (10)"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '312.699.248-00' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "EDVAN JOSE DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 52 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "058.482.684-28", "telefone": "11961548152", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '058.482.684-28' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ELIZABETE IANACONI CURSINO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2026-07-09", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "031.935.018-59", "telefone": "11977794484", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '031.935.018-59' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "FABIO PEREIRA DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA GONZALO BERCEO, 136, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "325.246.278-88", "telefone": "11949777602", "cep": "04855-410", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '325.246.278-88' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "FABIO VASCONCELOS DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 38, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "045.797.755-89", "telefone": "11965271174", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA TEOFANES", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '045.797.755-89' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "FRANCISCA SUELEN SARAIVA MOREIRA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "415.120.493-87", "telefone": "11970519007", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '415.120.493-87' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "HUGO EDUARDO OLIVEIRA NUNES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-12-30", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 201-A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "413.437.308-56", "telefone": "11969564751", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '413.437.308-56' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "IGOR RENATO SIQUEIRA DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Bloqueado", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA ANTROPOLOGIA, 52, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "486.123.708-41", "telefone": "11963606976", "cep": "04855-370", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '486.123.708-41' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "INêS FELICIANO DIAS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "323.883.248-40", "telefone": "11975673076", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA 01", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '323.883.248-40' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "INSTITUTO SEMENTE DE ESPERANçA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cnpj": "51.422.461/0001-93", "telefone": "11989803023", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'nome' = 'INSTITUTO SEMENTE DE ESPERANçA' AND dados->>'negocio' = 'Provedor' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JANAI SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA GONZALO BERCEO, 42, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "325.264.928-40", "telefone": "11960152584", "cep": "04855-410", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "CASA 06"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '325.264.928-40' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JANAIANA DOS SANTOS SANTANA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 22, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "488.171.088-55", "telefone": "11932110949", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '488.171.088-55' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JAQUELINE FERREIRA DOS REIS ALMEIDA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "350.624.718-26", "telefone": "11949327402", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '350.624.718-26' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JEAN DOS SANTOS BISPO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 256, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "863.953.205-21", "telefone": "11993556957", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '863.953.205-21' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JEOZADAQUE PEREIRA DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2026-04-28", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 19, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "381.634.438-04", "telefone": "11959589068", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '381.634.438-04' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JESSIEL DO CARMO DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-06-21", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 39, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "191.841.058-52", "telefone": "11946820266", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '191.841.058-52' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOãO LOPES VIANA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 45, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "266.203.238-39", "telefone": "11981366131", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '266.203.238-39' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOELMA AMORIMDA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 100 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "200.885.528-70", "telefone": "11970475696", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '200.885.528-70' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOSE CARLOS SOUZA DA CRUZ", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "280.942.258-31", "telefone": "11964226286", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '280.942.258-31' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOSE GERALDO DALOIA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "15", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "288.975.178-38", "telefone": "11954427848", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '288.975.178-38' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOSé SEVERINO DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 40 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "283.900.978-18", "telefone": "11984696765", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '283.900.978-18' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JOSUE SANTOS DOS ANJOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "654.944.585-04", "telefone": "11995578489", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '654.944.585-04' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "JUSSIAM BARBOSA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "309.092.898-16", "telefone": "11953333051", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '309.092.898-16' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "LAIZA NATALY DO NASCIMENTO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2026-01-20", "enderecoInstalacao": "RUA PIERRE BAYLE, 11, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "471.984.848-67", "telefone": "11930912600", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '471.984.848-67' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "LEANDRO BATISTA DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "230.140.888-46", "telefone": "11954235673", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '230.140.888-46' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "LUANA DE LIMA SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "15", "dataContrato": "2026-02-10", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "394.177.088-80", "telefone": "11976997930", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '394.177.088-80' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "LUCIMARIO DE ALMEIDA GUIMARAES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA PIERRE BAYLE, 22, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "227.237.748-30", "telefone": "11963569532", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '227.237.748-30' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "LUIZ HENRIQUE PEREIRA DE OLIVEIRA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Bloqueado", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "571.804.858-45", "telefone": "11961602680", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '571.804.858-45' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARCIA ANTONIA VIEIRA GARROS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-01-16", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 52, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "844.852.213-34", "telefone": "11981539103", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '844.852.213-34' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARCIEL CARVALHO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-06-15", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 199, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "077.458.245-67", "telefone": "11994604598", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA TEOFANES"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '077.458.245-67' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MáRCIO JOSé DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-11-09", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "311.300.728-35", "telefone": "11986065600", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA TEOFANES", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '311.300.728-35' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARIA APARECIDA ARAUJO LIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-30", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "118.609.168-13", "telefone": "11952779198", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '118.609.168-13' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARIA APARECIDA OLIVEIRA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-04-13", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 55, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "234.508.398-02", "telefone": "11917859079", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA TEOFANES"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '234.508.398-02' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARIA DE FATIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "191.848.318-39", "telefone": "11910705926", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '191.848.318-39' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARIA EFIGENIA VIANA DUARTE", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSE DIOGO ABADIANO, 45, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "260.665.698-99", "telefone": "11946600568", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "FUNDOS", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '260.665.698-99' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MARIA JULIA RODRIGUES DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-11-15", "enderecoInstalacao": "RUA ROGER BACON, 81, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "118.557.258-94", "telefone": "11946088262", "cep": "04855-360", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '118.557.258-94' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "MAX ALESSANDRO DAS NEVES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "15", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 100 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "838.705.805-00", "telefone": "11986779092", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '838.705.805-00' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "PATRICIA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "346.989.048-03", "telefone": "11979500312", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '346.989.048-03' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "PATRICIA SOARES VIEIRA ALVES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA ROGER BACON, 164, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "439.118.498-26", "telefone": "11961833687", "cep": "04855-360", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '439.118.498-26' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "PAULO FELIPE LEAO DA VEIGA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-12-24", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "228.383.108-36", "telefone": "11991172366", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '228.383.108-36' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "POP", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "1", "dataContrato": "2025-10-31", "enderecoInstalacao": "RUA PIERRE BAYLE, 77, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cnpj": "09.381.619/0001-68", "telefone": "11974296981", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'nome' = 'POP' AND dados->>'negocio' = 'Provedor' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RAFAEL DE OLIVEIRA SANTANA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 26, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "023.239.035-51", "telefone": "11962877917", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "VIELA 01", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '023.239.035-51' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RAFAEL SILVA BOVI", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "25", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "446.533.168-13", "telefone": "11998544060", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '446.533.168-13' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RAIMUNDO MARDôNIO DA SILVA FILHO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "042.919.393-96", "telefone": "11947629905", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '042.919.393-96' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RAQUEL PEREIRA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-02-16", "enderecoInstalacao": "RUA PIERRE BAYLE,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "900.988.178-41", "telefone": "11950477474", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "VIELA 02"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '900.988.178-41' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "REINALDO LUIZ DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2026-04-25", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 66, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "513.156.318-65", "telefone": "11949356883", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "VIELA 03"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '513.156.318-65' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RENATO HENRIQUE DA SILVA ARAUJO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "322.997.418-28", "telefone": "11930018123", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '322.997.418-28' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RICARDO WLMEIDA SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-30", "enderecoInstalacao": "RUA ROGER BACON, 32, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "361.835.818-01", "telefone": "11947857499", "cep": "04855-360", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '361.835.818-01' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ROBSON LUIZ DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "391.424.358-97", "telefone": "11946055130", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '391.424.358-97' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RONALD DA CRUZ SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "443.170.078-19", "telefone": "11981400275", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '443.170.078-19' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RONALD DA CRUZ SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA ANTROPOLOGIA,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "443.170.078-19", "telefone": "11981400275", "cep": "04855-370", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '443.170.078-19' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RONALDO VICENTE DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "234.293.328-26", "telefone": "11919673352", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '234.293.328-26' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "ROSIANE PONCIANO LEONCIO DE SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "400.825.298-33", "telefone": "11918380743", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '400.825.298-33' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "RUAN VITOR LIMA MACHADO", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Bloqueado", "diaVencimento": "20", "dataContrato": "2025-12-19", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 73, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "565.118.038-99", "telefone": "11950754621", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "TRAVESSA TEOFANES"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '565.118.038-99' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "SAMANTHA PAULA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "AVENIDA ADELINA ABRANCHES, 188, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "389.255.828-05", "telefone": "11951957672", "cep": "04855-430", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '389.255.828-05' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "SIDNEI SANTOS RODRIGUES", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA PIERRE BAYLE, 29, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "343.938.278-80", "telefone": "11917597397", "cep": "04855-400", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "ESCADAO (10)"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '343.938.278-80' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "SIMONE SANTOS DA SILVA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 145, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "339.789.758-07", "telefone": "11930018123", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '339.789.758-07' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "THAIS SILVA SOUZA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "405.648.748-09", "telefone": "11961345174", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '405.648.748-09' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "THAMIRYS SOUZA DOS SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "544.568.248-08", "telefone": "11937340033", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '544.568.248-08' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "VALDEIR DOS SANTOS DE JESUS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "411.317.248-01", "telefone": "11984339373", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA LIDIANE", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '411.317.248-01' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "VANESSA PEREIRA LIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 38, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "341.855.578-09", "telefone": "11950477474", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA TEOFANES", "referencia": "COLEGIO MORAES PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '341.855.578-09' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "VILOMAR ROQUE", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-12-09", "enderecoInstalacao": "RUA GONZALO BERCEO, 14, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "212.553.478-99", "telefone": "11976986803", "cep": "04855-410", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '212.553.478-99' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "WALISON DE LIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "30", "dataContrato": "2025-10-29", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO,48 A, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "200Mb"}], "cpf": "534.865.318-75", "telefone": "11977817394", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '534.865.318-75' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "WALLACE SANTOS", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "10", "dataContrato": "2025-12-09", "enderecoInstalacao": "RUA JOSÉ DIOGO ABADIANO, 45, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "380.554.278-01", "telefone": "11951995430", "cep": "04855-440", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO", "complemento": "TRAVESSA 01"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '380.554.278-01' AND user_id = v_uid);

  INSERT INTO cli_clientes (user_id, dados, created_at, updated_at)
  SELECT v_uid, '{"nome": "WELLINGTON DE LIMA", "tipo": "pessoa_fisica", "negocio": "Provedor", "receberLembretes": false, "contratos": [{"negocio": "Provedor", "status": "Ativo", "diaVencimento": "20", "dataContrato": "2026-01-07", "enderecoInstalacao": "RUA ANTROPOLOGIA, 38, JARDIM MORAIS PRADO", "observacoes": "", "planoNome": "100Mb"}], "cpf": "405.922.498-75", "telefone": "11942640087", "cep": "04855-370", "cidade": "SÃO PAULO", "uf": "SP", "bairro": "JARDIM MORAIS PRADO"}'::jsonb, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM cli_clientes WHERE dados->>'cpf' = '405.922.498-75' AND user_id = v_uid);

END;
$$;

-- Verificação
SELECT COUNT(*) AS total_provedor
FROM cli_clientes cl
JOIN auth.users u ON u.id = cl.user_id
WHERE u.email = 'welsoaress@gmail.com'
  AND cl.dados->>'negocio' = 'Provedor';
