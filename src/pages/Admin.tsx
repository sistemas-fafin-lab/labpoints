import { useState, useRef } from 'react';
import { Users, Award, Search, Edit, Plus, Trash2, Image, X } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useRewards, createReward, updateReward, deleteReward, uploadRewardImage, deleteRewardImage } from '../hooks/useRewards';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AvatarWithPreview } from '../components/AvatarWithPreview';
import { PointsBadge } from '../components/ui/PointsBadge';
import { UserManagementModal } from '../components/UserManagementModal';
import { User, Reward, DEPARTMENT_LABELS } from '../lib/supabase';

type Tab = 'users' | 'rewards';

export function Admin() {
  const { users, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useRewards(false);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // User modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

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
  
  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRewards = rewards.filter((reward) =>
    reward.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenUserEdit = (user: User) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  // Image upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Tipo de arquivo não permitido. Use apenas JPEG ou PNG.', 'error');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('Arquivo muito grande. O tamanho máximo é 5MB.', 'error');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Also clear the URL if editing
    setRewardForm(prev => ({ ...prev, imagem_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetRewardForm = () => {
    setEditingReward(null);
    setRewardForm({
      titulo: '',
      descricao: '',
      custo_points: '',
      categoria: '',
      imagem_url: '',
      ativo: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowRewardForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      let imageUrl = rewardForm.imagem_url;

      // Upload new image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          // Delete old image if editing and there was a previous image
          if (editingReward?.imagem_url) {
            await deleteRewardImage(editingReward.imagem_url);
          }
          imageUrl = await uploadRewardImage(imageFile, editingReward?.id);
        } catch (uploadError) {
          showToast((uploadError as Error).message || 'Erro ao fazer upload da imagem', 'error');
          setSavingReward(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      } else if (!imagePreview && editingReward?.imagem_url) {
        // Image was removed during editing
        await deleteRewardImage(editingReward.imagem_url);
        imageUrl = '';
      }

      const rewardData = {
        titulo: rewardForm.titulo,
        descricao: rewardForm.descricao,
        custo_points: custo,
        categoria: rewardForm.categoria,
        imagem_url: imageUrl || null,
        ativo: rewardForm.ativo,
      };

      if (editingReward) {
        await updateReward(editingReward.id, rewardData);
        showToast('Recompensa atualizada com sucesso', 'success');
      } else {
        await createReward(rewardData);
        showToast('Recompensa criada com sucesso', 'success');
      }

      await refetchRewards();
      resetRewardForm();
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
    // Set image preview if reward has an image
    if (reward.imagem_url) {
      setImagePreview(reward.imagem_url);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
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
                          <AvatarWithPreview
                            src={user.avatar_url}
                            alt={user.nome}
                            size="md"
                            fallbackText={user.nome}
                            user={{
                              id: user.id,
                              nome: user.nome,
                              avatar_url: user.avatar_url,
                              lab_points: user.lab_points,
                              department: user.department,
                              role: user.role,
                              created_at: user.created_at,
                            }}
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
                      resetRewardForm();
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
                      
                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-dm-sans font-medium text-lab-gray-700 mb-2">
                          Imagem da Recompensa
                        </label>
                        
                        {imagePreview ? (
                          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-36 object-cover"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              disabled={savingReward}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => !savingReward && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors ${
                              savingReward ? 'opacity-50 cursor-not-allowed' : 'hover:border-lab-primary cursor-pointer'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="p-2 rounded-full bg-gray-100">
                                <Image size={24} className="text-gray-400" />
                              </div>
                              <p className="text-sm font-dm-sans text-gray-600">
                                Clique para upload
                              </p>
                              <p className="text-xs text-gray-400">
                                JPEG ou PNG (máx. 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={savingReward}
                        />
                      </div>

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
                        {uploadingImage 
                          ? 'Enviando imagem...' 
                          : editingReward 
                            ? 'Salvar Alterações' 
                            : 'Criar Recompensa'
                        }
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={resetRewardForm}
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

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={userModalOpen}
        onClose={handleCloseUserModal}
        user={editingUser}
        onUpdate={refetchUsers}
      />
    </div>
  );
}
