-- Query de diagnóstico para verificar distribuição de gestores por departamento
-- Execute no Supabase SQL Editor para verificar quantos gestores existem

-- IMPORTANTE: No schema atual, cada usuário tem apenas UM departamento (campo department é ENUM)
-- A função select_random_approver seleciona ALEATORIAMENTE entre TODOS os gestores
-- do mesmo departamento, excluindo:
-- 1. O próprio requester (quem está solicitando)
-- 2. O target_user (quem vai receber os pontos)

-- 1. Contagem de usuários por role e departamento
SELECT 
  role,
  department,
  COUNT(*) as total,
  array_agg(nome ORDER BY nome) as usuarios
FROM users
GROUP BY role, department
ORDER BY department, role;

-- 2. Gestores disponíveis por departamento (com detalhes)
SELECT 
  department,
  COUNT(*) as total_gestores,
  array_agg(json_build_object(
    'id', id,
    'nome', nome,
    'email', email
  ) ORDER BY nome) as gestores
FROM users
WHERE role = 'gestor'
GROUP BY department
ORDER BY department;

-- 3. Admins disponíveis
SELECT 
  COUNT(*) as total_admins,
  array_agg(json_build_object(
    'id', id,
    'nome', nome,
    'email', email,
    'department', department
  ) ORDER BY nome) as admins
FROM users
WHERE role = 'adm';

-- 4. Cenário de teste: Verificar candidatos para aprovação
-- Exemplo: Se o gestor do RH solicitar pontos para um colaborador do RH,
-- quais gestores podem ser selecionados?
WITH test_scenario AS (
  SELECT 
    'RH'::text as departamento_teste,  -- ALTERE AQUI
    (SELECT id FROM users WHERE role = 'gestor' AND department::text = 'RH' LIMIT 1) as requester_id,  -- ALTERE AQUI
    (SELECT id FROM users WHERE role = 'colab' AND department::text = 'RH' LIMIT 1) as target_user_id  -- ALTERE AQUI
)
SELECT 
  u.id,
  u.nome,
  u.email,
  u.department,
  u.role,
  CASE 
    WHEN u.id = ts.requester_id THEN '❌ É o requester (excluído)'
    WHEN u.id = ts.target_user_id THEN '❌ É o target (excluído)'
    ELSE '✅ Pode ser selecionado'
  END as status
FROM users u
CROSS JOIN test_scenario ts
WHERE u.role = 'gestor'
  AND u.department::text = ts.departamento_teste
ORDER BY u.nome;

-- 5. Simulação de seleção aleatória (execute 10 vezes para verificar distribuição)
-- Esta query simula a seleção e mostra qual gestor seria escolhido
DO $$
DECLARE
  v_result record;
  v_counts jsonb := '{}';
  v_i integer;
  v_dept text := 'RH'; -- ALTERE AQUI PARA SEU DEPARTAMENTO
  v_requester uuid := (SELECT id FROM users WHERE role = 'gestor' AND department::text = 'RH' LIMIT 1); -- ALTERE AQUI
BEGIN
  -- Simular 100 seleções
  FOR v_i IN 1..100 LOOP
    SELECT id, nome INTO v_result
    FROM users
    WHERE role = 'gestor'
      AND department::text = v_dept
      AND id != v_requester
    ORDER BY random()
    LIMIT 1;
    
    -- Contar quantas vezes cada gestor foi selecionado
    IF v_counts ? v_result.nome THEN
      v_counts := jsonb_set(v_counts, ARRAY[v_result.nome], to_jsonb((v_counts->>v_result.nome)::int + 1));
    ELSE
      v_counts := jsonb_set(v_counts, ARRAY[v_result.nome], '1');
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Distribuição de seleções (100 tentativas): %', v_counts;
END $$;

-- 6. Query para verificar histórico real de seleções
SELECT 
  u.nome as aprovador_selecionado,
  u.department,
  COUNT(*) as vezes_selecionado,
  array_agg(DISTINCT req.nome) as requesters
FROM pending_point_assignments ppa
JOIN users u ON ppa.selected_approver_id = u.id
JOIN users req ON ppa.requester_id = req.id
GROUP BY u.id, u.nome, u.department
ORDER BY vezes_selecionado DESC;
