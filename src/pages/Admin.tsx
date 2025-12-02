import { useState } from 'react';
import { Users, Award, Search, Edit, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useUsers, updateUser } from '../hooks/useUsers';
import { useRewards, createReward, updateReward, deleteReward } from '../hooks/useRewards';
import { createTransaction } from '../hooks/useTransactions';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { PointsBadge } from '../components/ui/PointsBadge';
import { User, Reward, DEPARTMENT_LABELS, DEPARTMENTS_LIST, DepartmentEnum, UserRole, supabase } from '../lib/supabase';

type Tab = 'users' | 'rewards';

export function Admin() {
  const { users, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useRewards(false);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserRole, setEditUserRole] = useState<UserRole>('colaborador');
  const [editUserDepartment, setEditUserDepartment] = useState<DepartmentEnum | ''>('');
  const [editGestorDepartments, setEditGestorDepartments] = useState<DepartmentEnum[]>([]);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [pointsDescription, setPointsDescription] = useState('');
  const [updatingPoints, setUpdatingPoints] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    titulo: '',
    descricao: '',
    custo_points: '',
    categoria: '',
    imagem_url: '',
    ativo: true,
  });
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [savingReward, setSavingReward] = useState(false);
  const [deletingReward, setDeletingReward] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRewards = rewards.filter((reward) =>
    reward.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPoints = async () => {
    if (!editingUser || !pointsToAdd || !pointsDescription) {
      showToast('Preencha todos os campos', 'error');
      return;
    }

    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points === 0) {
      showToast('Valor de pontos inválido', 'error');
      return;
    }

    setUpdatingPoints(true);

    try {
      await createTransaction({
        user_id: editingUser.id,
        tipo: points > 0 ? 'credito' : 'debito',
        valor: Math.abs(points),
        descricao: pointsDescription,
      });

      await refetchUsers();
      showToast('Pontos atualizados com sucesso', 'success');
      setEditingUser(null);
      setPointsToAdd('');
      setPointsDescription('');
    } catch (error) {
      showToast('Erro ao atualizar pontos', 'error');
    } finally {
      setUpdatingPoints(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'adm' ? 'colaborador' : 'adm';

    try {
      await updateUser(user.id, { role: newRole });
      await refetchUsers();
      showToast(`Usuário alterado para ${newRole}`, 'success');
    } catch (error) {
      showToast('Erro ao alterar role', 'error');
    }
  };

  const handleOpenUserEdit = async (user: User) => {
    setEditingUser(user);
    setEditUserRole(user.role);
    setEditUserDepartment(user.department || '');
    
    // Se for gestor, buscar departamentos que gerencia
    if (user.role === 'gestor') {
      try {
        const { data } = await supabase
          .from('gestor_departments')
          .select('department')
          .eq('gestor_id', user.id);
        
        setEditGestorDepartments(data?.map(d => d.department) || []);
      } catch {
        setEditGestorDepartments([]);
      }
    } else {
      setEditGestorDepartments([]);
    }
  };

  const handleSaveUserChanges = async () => {
    if (!editingUser) return;
    
    setSavingUser(true);
    try {
      // Atualizar role e departamento do usuário
      await updateUser(editingUser.id, { 
        role: editUserRole,
        department: editUserDepartment || null
      });

      // Se for gestor, atualizar departamentos gerenciados
      if (editUserRole === 'gestor') {
        // Remover departamentos antigos
        await supabase
          .from('gestor_departments')
          .delete()
          .eq('gestor_id', editingUser.id);
        
        // Adicionar novos departamentos
        if (editGestorDepartments.length > 0) {
          await supabase
            .from('gestor_departments')
            .insert(editGestorDepartments.map(dept => ({
              gestor_id: editingUser.id,
              department: dept
            })));
        }
      } else {
        // Se não for mais gestor, remover todos os departamentos gerenciados
        await supabase
          .from('gestor_departments')
          .delete()
          .eq('gestor_id', editingUser.id);
      }

      await refetchUsers();
      showToast('Usuário atualizado com sucesso', 'success');
      setEditingUser(null);
    } catch (error) {
      showToast('Erro ao atualizar usuário', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const toggleGestorDepartment = (dept: DepartmentEnum) => {
    setEditGestorDepartments(prev => 
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleSaveReward = async () => {
    if (
      !rewardForm.titulo ||
      !rewardForm.descricao ||
      !rewardForm.custo_points ||
      !rewardForm.categoria
    ) {
      showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const custo = parseInt(rewardForm.custo_points);
    if (isNaN(custo) || custo <= 0) {
      showToast('Custo deve ser um número positivo', 'error');
      return;
    }

    setSavingReward(true);

    try {
      const rewardData = {
        ...rewardForm,
        custo_points: custo,
      };

      if (editingReward) {
        await updateReward(editingReward.id, rewardData);
        showToast('Recompensa atualizada com sucesso', 'success');
      } else {
        await createReward(rewardData);
        showToast('Recompensa criada com sucesso', 'success');
      }

      await refetchRewards();
      setEditingReward(null);
      setRewardForm({
        titulo: '',
        descricao: '',
        custo_points: '',
        categoria: '',
        imagem_url: '',
        ativo: true,
      });
      setShowRewardForm(false);
    } catch (error) {
      showToast('Erro ao salvar recompensa', 'error');
    } finally {
      setSavingReward(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    setDeletingReward(id);

    try {
      await deleteReward(id);
      await refetchRewards();
      showToast('Recompensa excluída com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao excluir recompensa', 'error');
    } finally {
      setDeletingReward(null);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setRewardForm({
      titulo: reward.titulo,
      descricao: reward.descricao,
      custo_points: reward.custo_points.toString(),
      categoria: reward.categoria,
      imagem_url: reward.imagem_url || '',
      ativo: reward.ativo,
    });
    setShowRewardForm(true);
  };

  return (
    <div className="min-h-screen bg-lab-gray-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-ranade font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-lab-gray-700 font-dm-sans">
            Gerencie usuários e recompensas da plataforma
          </p>
        </div>

        <div className="bg-white rounded-lab shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-24 py-16 font-ranade transition-colors ${
                  activeTab === 'users'
                    ? 'bg-lab-primary text-white'
                    : 'text-lab-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users size={20} className="inline mr-2" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 px-24 py-16 font-ranade transition-colors ${
                  activeTab === 'rewards'
                    ? 'bg-lab-primary text-white'
                    : 'text-lab-gray-700 hover:bg-gray-50'
                }`}
              >
                <Award size={20} className="inline mr-2" />
                Recompensas
              </button>
            </nav>
          </div>

          <div className="p-24">
            <div className="mb-24">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lab-gray-700"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'users' ? 'Buscar usuários...' : 'Buscar recompensas...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lab border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-lab-accent focus:border-transparent font-dm-sans"
                />
              </div>
            </div>

            {activeTab === 'users' && (
              <div>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded-lab animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-16 bg-lab-gray-100 rounded-lab"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar
                            src={user.avatar_url}
                            alt={user.nome}
                            size="md"
                            fallbackText={user.nome}
                          />
                          <div className="flex-1">
                            <h3 className="font-ranade font-bold text-gray-900">{user.nome}</h3>
                            <p className="text-sm font-dm-sans text-lab-gray-700">{user.email}</p>
                            <p className="text-xs font-dm-sans text-lab-gray-700 mt-1">
                              {user.department ? DEPARTMENT_LABELS[user.department] : 'Sem departamento'}
                            </p>
                          </div>
                          <PointsBadge points={user.lab_points} size="sm" />
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-dm-sans font-medium ${
                              user.role === 'adm'
                                ? 'bg-lab-accent bg-opacity-20 text-lab-accent'
                                : user.role === 'gestor'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {user.role === 'adm' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                          </span>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenUserEdit(user)}
                            className="!min-w-0 !px-3"
                          >
                            <Edit size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <div className="mb-24">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingReward(null);
                      setRewardForm({
                        titulo: '',
                        descricao: '',
                        custo_points: '',
                        categoria: '',
                        imagem_url: '',
                        ativo: true,
                      });
                      setShowRewardForm(true);
                    }}
                  >
                    <Plus size={20} className="mr-2" />
                    Nova Recompensa
                  </Button>
                </div>

                {(editingReward !== null || showRewardForm) && (
                  <div className="bg-lab-light bg-opacity-100 rounded-lab p-24 mb-24">
                    <h3 className="text-xl font-ranade font-bold text-gray-900 mb-16">
                      {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <Input
                        label="Título"
                        value={rewardForm.titulo}
                        onChange={(e) =>
                          setRewardForm({ ...rewardForm, titulo: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Categoria"
                        value={rewardForm.categoria}
                        onChange={(e) =>
                          setRewardForm({ ...rewardForm, categoria: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Custo (Lab Points)"
                        type="number"
                        value={rewardForm.custo_points}
                        onChange={(e) =>
                          setRewardForm({ ...rewardForm, custo_points: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="URL da Imagem"
                        value={rewardForm.imagem_url}
                        onChange={(e) =>
                          setRewardForm({ ...rewardForm, imagem_url: e.target.value })
                        }
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-dm-sans font-medium text-lab-gray-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={rewardForm.descricao}
                          onChange={(e) =>
                            setRewardForm({ ...rewardForm, descricao: e.target.value })
                          }
                          rows={3}
                          className="w-full px-4 py-3 rounded-lab border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-lab-accent focus:border-transparent font-dm-sans"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={rewardForm.ativo}
                          onChange={(e) =>
                            setRewardForm({ ...rewardForm, ativo: e.target.checked })
                          }
                          className="w-5 h-5 text-lab-primary focus:ring-lab-accent rounded"
                        />
                        <label htmlFor="ativo" className="font-dm-sans text-gray-900">
                          Recompensa ativa
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-16">
                      <Button
                        variant="primary"
                        onClick={handleSaveReward}
                        loading={savingReward}
                      >
                        {editingReward ? 'Salvar Alterações' : 'Criar Recompensa'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingReward(null);
                          setRewardForm({
                            titulo: '',
                            descricao: '',
                            custo_points: '',
                            categoria: '',
                            imagem_url: '',
                            ativo: true,
                          });
                          setShowRewardForm(false);
                        }}
                        disabled={savingReward}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {rewardsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded-lab animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-16 bg-lab-gray-100 rounded-lab"
                      >
                        <div className="flex-1">
                          <h3 className="font-ranade font-bold text-gray-900">
                            {reward.titulo}
                          </h3>
                          <p className="text-sm font-dm-sans text-lab-gray-700 mt-1">
                            {reward.descricao}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <PointsBadge points={reward.custo_points} size="sm" />
                            <span className="text-xs font-dm-sans text-lab-gray-700">
                              {reward.categoria}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-dm-sans font-medium ${
                              reward.ativo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {reward.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => handleEditReward(reward)}
                            className="!min-w-0 !px-3"
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteReward(reward.id)}
                            loading={deletingReward === reward.id}
                            className="!min-w-0 !px-3"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-lab-primary to-indigo-500 p-6 text-white rounded-t-2xl">
              <h2 className="text-xl font-ranade font-bold text-white">
                Gerenciar Usuário
              </h2>
              <p className="text-white/80 text-sm mt-1">{editingUser.nome}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Avatar
                  src={editingUser.avatar_url}
                  alt={editingUser.nome}
                  size="md"
                  fallbackText={editingUser.nome}
                />
                <div className="flex-1">
                  <p className="font-ranade font-bold text-gray-900">{editingUser.nome}</p>
                  <p className="text-sm font-dm-sans text-lab-gray-700">{editingUser.email}</p>
                  <p className="text-sm font-dm-sans text-lab-gray-700">
                    Saldo: {editingUser.lab_points} pontos
                  </p>
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                  Função do Usuário
                </label>
                <div className="relative">
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 appearance-none bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all font-dm-sans text-slate-800 pr-10"
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="gestor">Gestor</option>
                    <option value="adm">Administrador</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Department Select */}
              <div>
                <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                  Departamento do Usuário
                </label>
                <div className="relative">
                  <select
                    value={editUserDepartment}
                    onChange={(e) => setEditUserDepartment(e.target.value as DepartmentEnum)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 appearance-none bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all font-dm-sans text-slate-800 pr-10"
                  >
                    <option value="">Selecione o departamento</option>
                    {DEPARTMENTS_LIST.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Gestor Departments (only if role is gestor) */}
              {editUserRole === 'gestor' && (
                <div>
                  <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                    Departamentos Gerenciados
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Selecione os departamentos que este gestor pode gerenciar
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {DEPARTMENTS_LIST.map((dept) => (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() => toggleGestorDepartment(dept.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-dm-sans text-left transition-all ${
                          editGestorDepartments.includes(dept.value)
                            ? 'bg-lab-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {dept.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Points Section */}
              <div>
                <h3 className="text-sm font-dm-sans font-semibold text-slate-700 mb-4">
                  Gerenciar Pontos
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Pontos (use valores negativos para remover)"
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    placeholder="Ex: 100 ou -50"
                  />

                  <Input
                    label="Descrição da Transação"
                    value={pointsDescription}
                    onChange={(e) => setPointsDescription(e.target.value)}
                    placeholder="Motivo da transação"
                  />

                  <Button
                    variant="secondary"
                    onClick={handleAddPoints}
                    loading={updatingPoints}
                    disabled={!pointsToAdd || !pointsDescription}
                    className="w-full"
                  >
                    Adicionar/Remover Pontos
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-3 rounded-b-2xl">
              <Button
                variant="primary"
                onClick={handleSaveUserChanges}
                loading={savingUser}
                className="flex-1"
              >
                Salvar Alterações
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditingUser(null)}
                disabled={savingUser || updatingPoints}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
