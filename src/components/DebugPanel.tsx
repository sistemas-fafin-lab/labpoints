import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function DebugPanel() {
  const { user, supabaseUser, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testLogin = async () => {
    console.log('🔐 Testando login admin...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@lab.com',
        password: '123456'
      });
      
      if (error) {
        console.error('❌ Erro no login:', error);
        setDebugInfo((prev: any) => ({ ...prev, loginTest: `Erro: ${error.message}` }));
      } else {
        console.log('✅ Login OK:', data.user?.email);
        
        // Verificar se consegue buscar o perfil após login
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError);
          setDebugInfo((prev: any) => ({ 
            ...prev, 
            loginTest: `Login OK, mas erro no perfil: ${profileError.message}` 
          }));
        } else {
          console.log('✅ Perfil encontrado:', profile.nome);
          setDebugInfo((prev: any) => ({ 
            ...prev, 
            loginTest: `Sucesso completo: ${data.user?.email} - ${profile.nome}` 
          }));
        }
        
        setTimeout(runDiagnostics, 1000);
      }
    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      setDebugInfo((prev: any) => ({ ...prev, loginTest: `Erro: ${err.message}` }));
    }
  };

  const createTestUser = async () => {
    console.log('👤 Criando usuário de teste...');
    try {
      // Primeiro criar no auth
      const { error: authError } = await supabase.auth.signUp({
        email: 'teste@lab.com',
        password: '123456',
        options: {
          data: {
            nome: 'Usuário Teste',
            cargo: 'Desenvolvedor',
            role: 'colaborador'
          }
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar auth:', authError);
        setDebugInfo({ createTest: `Erro Auth: ${authError.message}` });
        return;
      }

      console.log('✅ Auth criado, aguardando trigger...');
      setTimeout(async () => {
        await runDiagnostics();
      }, 2000);

    } catch (err: any) {
      console.error('❌ Erro na criação:', err);
      setDebugInfo({ createTest: `Erro: ${err.message}` });
    }
  };

  const runDiagnostics = async () => {
    console.log('🔍 Executando diagnósticos...');
    const info: any = {};

    try {
      // Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      info.session = session ? 'Ativa' : 'Inativa';
      info.sessionUser = session?.user?.email || 'N/A';

      // Verificar usuários no banco (com detalhes do erro)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        info.usersInDB = `Erro: ${usersError.message}`;
        info.usersErrorCode = usersError.code;
        info.usersErrorDetails = usersError.details;
      } else {
        info.usersInDB = users?.length || 0;
        info.usersEmails = users?.map(u => u.email).join(', ') || 'Nenhum';
      }

      // Testar consulta sem RLS (como service_role)
      try {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        info.usersCountTotal = countError ? `Erro count: ${countError.message}` : count;
      } catch {
        info.usersCountTotal = 'Erro na contagem';
      }

      // Verificar se conseguimos acessar auth.users diretamente
      try {
        const { data: authUsers, error: authError } = await supabase
          .rpc('get_auth_users_count');
        info.authUsersCount = authError ? `Erro RPC: ${authError.message}` : authUsers;
      } catch {
        info.authUsersCount = 'RPC não disponível';
      }

      // Verificar conectividade
      const { error: connectError } = await supabase.from('users').select('count', { count: 'exact', head: true });
      info.connectivity = connectError ? `Erro: ${connectError.message}` : 'OK';

      // Testar inserção simples para verificar RLS
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@test.com',
            nome: 'Teste',
            cargo: 'Teste',
            role: 'colaborador'
          }]);
        info.insertTest = insertError ? `Erro: ${insertError.message}` : 'OK (não inserido)';
      } catch (insertErr: any) {
        info.insertTest = `Erro: ${insertErr.message}`;
      }

      // Estado do contexto
      info.contextLoading = loading;
      info.contextUser = user ? user.nome : 'null';
      info.contextSupabaseUser = supabaseUser ? supabaseUser.email : 'null';

    } catch (error: any) {
      info.error = error.message;
    }

    setDebugInfo(info);
    console.log('📊 Informações de debug:', info);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🛠️ Debug Panel</h4>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={runDiagnostics} style={{ marginRight: '5px', fontSize: '11px' }}>
          Diagnósticos
        </button>
        <button onClick={testLogin} style={{ marginRight: '5px', fontSize: '11px' }}>
          Teste Login
        </button>
        <button onClick={createTestUser} style={{ fontSize: '11px' }}>
          Criar Teste
        </button>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => window.location.href = '/login'} style={{ fontSize: '11px' }}>
          Ir para Login
        </button>
      </div>
      
      {debugInfo && (
        <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
          <div><strong>Sessão:</strong> {debugInfo.session}</div>
          <div><strong>Usuário da Sessão:</strong> {debugInfo.sessionUser}</div>
          <div><strong>Usuários no DB:</strong> {debugInfo.usersInDB}</div>
          {debugInfo.usersEmails && <div><strong>Emails:</strong> {debugInfo.usersEmails}</div>}
          {debugInfo.usersErrorCode && <div style={{ color: 'red' }}><strong>Erro Code:</strong> {debugInfo.usersErrorCode}</div>}
          {debugInfo.usersErrorDetails && <div style={{ color: 'red' }}><strong>Detalhes:</strong> {debugInfo.usersErrorDetails}</div>}
          <div><strong>Count Total:</strong> {debugInfo.usersCountTotal}</div>
          <div><strong>Auth Users:</strong> {debugInfo.authUsersCount}</div>
          <div><strong>Conectividade:</strong> {debugInfo.connectivity}</div>
          <div><strong>Teste Insert:</strong> {debugInfo.insertTest}</div>
          <div><strong>Context Loading:</strong> {debugInfo.contextLoading?.toString()}</div>
          <div><strong>Context User:</strong> {debugInfo.contextUser}</div>
          <div><strong>Context Supabase User:</strong> {debugInfo.contextSupabaseUser}</div>
          {debugInfo.loginTest && <div style={{ color: debugInfo.loginTest.includes('Sucesso') ? 'green' : 'orange' }}><strong>Teste Login:</strong> {debugInfo.loginTest}</div>}
          {debugInfo.error && <div style={{ color: 'red' }}><strong>Erro:</strong> {debugInfo.error}</div>}
        </div>
      )}
    </div>
  );
}