import { useState } from 'react';
import { User as UserIcon, History, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useRedemptions } from '../hooks/useRedemptions';
import { useToast } from '../components/ui/Toast';
import { Avatar } from '../components/ui/Avatar';
import { PointsBadge } from '../components/ui/PointsBadge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { updateUser } from '../hooks/useUsers';

type Tab = 'info' | 'transactions' | 'redemptions';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { redemptions, loading: redemptionsLoading } = useRedemptions(user?.id);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome || '');
  const [cargo, setCargo] = useState(user?.cargo || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!nome.trim() || !cargo.trim()) {
      showToast('Nome e cargo são obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.id, { nome, cargo });
      await refreshUser();
      showToast('Perfil atualizado com sucesso', 'success');
      setEditing(false);
    } catch {
      showToast('Erro ao atualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNome(user.nome);
    setCargo(user.cargo);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-lab-gray-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lab shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
          {/* Banner superior */}
          <div className="bg-lab-gradient h-32 mb-20" />

          <div className="px-8 md:px-24 pb-16">
            {/* Header de perfil */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8 lg:gap-12 -mt-12 md:-mt-16 mb-16 md:mb-24">
              <Avatar
                src={user.avatar_url}
                alt={user.nome}
                size="xl"
                fallbackText={user.nome}
              />

              <div className="flex-1 space-y-2">
                <h1 className="text-2xl font-ranade font-bold text-gray-900">
                  {user.nome}
                </h1>
                <p className="text-lab-gray-700 font-dm-sans">{user.cargo}</p>
                <PointsBadge points={user.lab_points} size="lg" />
              </div>

              <div className="text-right">
                <p className="text-sm font-dm-sans text-lab-gray-700">
                  {user.role === 'adm' ? 'Administrador' : 'Colaborador'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-16 md:mb-24">
              <nav className="flex gap-10 lg:gap-16">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-4 px-2 font-ranade transition-colors relative ${
                    activeTab === 'info'
                      ? 'text-lab-primary'
                      : 'text-lab-gray-700 hover:text-gray-900'
                  }`}
                >
                  <UserIcon size={20} className="inline mr-2" />
                  Informações
                  {activeTab === 'info' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-lab-primary rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`pb-4 px-2 font-ranade transition-colors relative ${
                    activeTab === 'transactions'
                      ? 'text-lab-primary'
                      : 'text-lab-gray-700 hover:text-gray-900'
                  }`}
                >
                  <History size={20} className="inline mr-2" />
                  Transações
                  {activeTab === 'transactions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-lab-primary rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('redemptions')}
                  className={`pb-4 px-2 font-ranade transition-colors relative ${
                    activeTab === 'redemptions'
                      ? 'text-lab-primary'
                      : 'text-lab-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Award size={20} className="inline mr-2" />
                  Meus Resgates
                  {activeTab === 'redemptions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-lab-primary rounded-full" />
                  )}
                </button>
              </nav>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'info' && (
              <div className="space-y-10 md:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <Input
                    label="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={!editing}
                  />

                  <Input
                    label="Cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    disabled={!editing}
                  />

                  <Input label="Email" value={user.email} disabled />

                  <Input
                    label="Membro desde"
                    value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                    disabled
                  />
                </div>

                <div className="flex gap-3">
                  {!editing ? (
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button variant="primary" onClick={handleSave} loading={saving}>
                        Salvar Alterações
                      </Button>
                      <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-6 md:p-8 bg-lab-gray-100 rounded-lab hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-dm-sans text-gray-900 font-medium">
                            {transaction.descricao}
                          </p>
                          <p className="text-sm font-dm-sans text-lab-gray-700 mt-1">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xl font-ranade font-bold ${
                              transaction.tipo === 'credito'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.tipo === 'credito' ? '+' : '-'}
                            {transaction.valor}
                          </p>
                          <p className="text-xs font-dm-sans text-lab-gray-700">
                            {transaction.tipo === 'credito' ? 'Crédito' : 'Débito'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <History size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-50" />
                    <p className="text-lab-gray-700 font-dm-sans">
                      Nenhuma transação registrada
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'redemptions' && (
              <div>
                {redemptionsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-40 bg-gray-200 rounded-lab animate-pulse" />
                    ))}
                  </div>
                ) : redemptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {redemptions.map((redemption) => (
                      <div
                        key={redemption.id}
                        className="bg-lab-gray-100 rounded-lab p-6 md:p-8 border-l-4 border-lab-accent hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-ranade font-bold text-gray-900">
                            {redemption.reward?.titulo || 'Recompensa'}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-dm-sans font-medium ${
                              redemption.status === 'concluido'
                                ? 'bg-green-100 text-green-800'
                                : redemption.status === 'pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {redemption.status === 'concluido'
                              ? 'Concluído'
                              : redemption.status === 'pendente'
                              ? 'Pendente'
                              : 'Cancelado'}
                          </span>
                        </div>

                        <p className="text-sm font-dm-sans text-lab-gray-700 mb-4">
                          {redemption.reward?.descricao}
                        </p>

                        <div className="flex items-center justify-between">
                          <PointsBadge points={redemption.custo_points} size="sm" />
                          <p className="text-xs font-dm-sans text-lab-gray-700">
                            {new Date(redemption.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <Award size={48} className="mx-auto text-lab-gray-700 mb-4 opacity-50" />
                    <p className="text-lab-gray-700 font-dm-sans">
                      Você ainda não resgatou nenhuma recompensa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
