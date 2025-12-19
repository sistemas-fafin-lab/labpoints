/*
  # Fix: Recriar função select_random_approver

  ## Problema
  A função `select_random_approver` não existe ou foi criada com tipos incorretos.
  A coluna department usa um tipo ENUM, não TEXT.
  
  ## Solução
  Recriar a função com os tipos corretos e fazer cast apropriado.
*/

-- Dropar função se existir com tipos incorretos
DROP FUNCTION IF EXISTS select_random_approver(text, uuid);
DROP FUNCTION IF EXISTS select_random_approver(uuid, text);

-- Recriar função para selecionar aprovador aleatório
-- Usando TEXT e fazendo cast para o enum quando necessário
CREATE OR REPLACE FUNCTION select_random_approver(
  p_requester_id uuid,
  p_department text,
  p_target_user_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_approver_id uuid;
BEGIN
  -- Forçar nova seed aleatória usando timestamp + random para garantir aleatoriedade
  PERFORM setseed(extract(epoch from clock_timestamp()) - floor(extract(epoch from clock_timestamp())));
  
  -- Buscar gestor aleatório do mesmo departamento
  -- Excluindo o requester E o target_user (usuário que receberá os pontos)
  SELECT id INTO v_approver_id
  FROM users
  WHERE role = 'gestor'
    AND department::text = p_department
    AND id != p_requester_id
    AND (p_target_user_id IS NULL OR id != p_target_user_id)
  ORDER BY random()
  LIMIT 1;
  
  -- Se não encontrar gestor, buscar admin como fallback
  -- Também excluindo o requester e o target_user
  IF v_approver_id IS NULL THEN
    SELECT id INTO v_approver_id
    FROM users
    WHERE role = 'adm'
      AND id != p_requester_id
      AND (p_target_user_id IS NULL OR id != p_target_user_id)
    ORDER BY random()
    LIMIT 1;
  END IF;
  
  RETURN v_approver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários autenticados chamarem a função
-- Com DEFAULT NULL no terceiro parâmetro, a função pode ser chamada com 2 ou 3 argumentos
GRANT EXECUTE ON FUNCTION select_random_approver(uuid, text, uuid) TO authenticated;

-- Também garantir que create_point_assignment existe
CREATE OR REPLACE FUNCTION create_point_assignment(
  p_requester_id uuid,
  p_target_user_id uuid,
  p_points integer,
  p_justification text
)
RETURNS jsonb AS $$
DECLARE
  v_requester_dept text;
  v_target_dept text;
  v_requester_role text;
  v_approver_id uuid;
  v_assignment_id uuid;
BEGIN
  -- Verificar role do requester (fazendo cast do department para text)
  SELECT role, department::text INTO v_requester_role, v_requester_dept
  FROM users WHERE id = p_requester_id;
  
  IF v_requester_role NOT IN ('gestor', 'adm') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não tem permissão para atribuir pontos');
  END IF;
  
  -- Verificar departamento do target (fazendo cast para text)
  SELECT department::text INTO v_target_dept
  FROM users WHERE id = p_target_user_id;
  
  -- Gestores só podem atribuir a usuários do mesmo departamento
  IF v_requester_role = 'gestor' AND v_requester_dept IS DISTINCT FROM v_target_dept THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gestor só pode atribuir pontos a usuários do mesmo departamento');
  END IF;
  
  -- Selecionar aprovador aleatório (passando target_user_id para evitar que seja selecionado)
  v_approver_id := select_random_approver(p_requester_id, COALESCE(v_requester_dept, v_target_dept), p_target_user_id);
  
  IF v_approver_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não há aprovadores disponíveis. É necessário ter outro gestor do mesmo departamento ou um administrador.');
  END IF;
  
  -- Criar a solicitação
  INSERT INTO pending_point_assignments (
    requester_id, target_user_id, points, justification, 
    selected_approver_id, selected_at
  )
  VALUES (
    p_requester_id, p_target_user_id, p_points, p_justification,
    v_approver_id, now()
  )
  RETURNING id INTO v_assignment_id;
  
  -- Criar log de auditoria (se a função existir)
  BEGIN
    PERFORM create_audit_log(
      'ASSIGNMENT_CREATED',
      'pending_point_assignments',
      v_assignment_id,
      p_requester_id,
      NULL,
      jsonb_build_object(
        'target_user_id', p_target_user_id,
        'points', p_points,
        'justification', p_justification,
        'approver_id', v_approver_id
      ),
      NULL
    );
  EXCEPTION
    WHEN undefined_function THEN
      -- Função de audit não existe, continuar sem log
      NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true, 
    'assignment_id', v_assignment_id,
    'approver_id', v_approver_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION create_point_assignment(uuid, uuid, integer, text) TO authenticated;
