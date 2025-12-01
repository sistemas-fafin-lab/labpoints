import { supabase } from './lib/supabase';

async function checkDatabase() {
  console.log('🔍 Verificando banco de dados...');
  
  try {
    // Verificar usuários
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('👥 Usuários no banco:', users.length);
      users.forEach(user => {
        console.log(`  - ${user.nome} (${user.email}) - ${user.role}`);
      });
    }
    
    // Verificar se RLS está configurado
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('check_table_policies', { table_name: 'users' });
        
      if (rlsError) {
        console.log('⚠️ Não foi possível verificar RLS:', rlsError);
      } else {
        console.log('🔒 Políticas RLS:', rlsData);
      }
    } catch (rlsError) {
      console.log('⚠️ RPC não disponível:', rlsError);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Auto-executar
checkDatabase();

export { checkDatabase };