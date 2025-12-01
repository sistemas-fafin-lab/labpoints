import { supabase } from './lib/supabase';

async function testLoginFlow() {
  console.log('🧪 Testando fluxo de login...');
  
  // Primeiro, vamos criar um usuário de teste se não existir
  const testEmail = 'teste@lab.com';
  const testPassword = '123456';
  const testNome = 'Usuário Teste';
  const testCargo = 'Desenvolvedor';
  
  try {
    // Verificar se o usuário já existe
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail);
      
    if (existingUsers && existingUsers.length > 0) {
      console.log('👤 Usuário de teste já existe:', existingUsers[0].nome);
    } else {
      console.log('📝 Criando usuário de teste...');
      
      // Criar usuário
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            nome: testNome,
            cargo: testCargo,
            role: 'colaborador',
          },
        },
      });
      
      if (signupError) {
        console.error('❌ Erro ao criar usuário:', signupError);
      } else {
        console.log('✅ Usuário criado:', signupData.user?.email);
        
        // Aguardar trigger
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se o perfil foi criado
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('email', testEmail)
          .single();
          
        if (profile) {
          console.log('✅ Perfil criado pelo trigger:', profile.nome);
        } else {
          console.log('❌ Perfil não foi criado pelo trigger');
        }
      }
    }
    
    // Agora testar o login
    console.log('🔐 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError);
    } else {
      console.log('✅ Login bem-sucedido:', loginData.user?.email);
      
      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
        
      if (profile) {
        console.log('✅ Perfil encontrado:', profile.nome, '- Pontos:', profile.lab_points);
      } else {
        console.error('❌ Perfil não encontrado após login');
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('👋 Logout realizado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Auto-executar após 2 segundos
setTimeout(testLoginFlow, 2000);

export { testLoginFlow };