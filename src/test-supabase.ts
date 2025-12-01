import { supabase } from './lib/supabase';

// Teste de conectividade com Supabase
async function testSupabaseConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Teste 1: Verificar se podemos nos conectar
    const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao conectar com Supabase:', error);
      return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    console.log('Número de usuários na tabela:', data);
    
    // Teste 2: Verificar se as tabelas existem
    const tables = ['users', 'rewards', 'transactions', 'redemptions'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          console.error(`❌ Erro na tabela ${table}:`, tableError);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
        }
      } catch (err) {
        console.error(`❌ Erro ao acessar tabela ${table}:`, err);
      }
    }
    
    // Teste 3: Verificar estado da autenticação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError);
    } else {
      console.log('Estado da sessão:', session ? 'Autenticado' : 'Não autenticado');
      if (session) {
        console.log('Usuário:', session.user.email);
      }
    }
    
  } catch (err) {
    console.error('Erro geral no teste:', err);
  }
}

// Executar o teste quando a página carregar
if (typeof window !== 'undefined') {
  window.addEventListener('load', testSupabaseConnection);
}

export { testSupabaseConnection };