import { useState, useRef } from 'react';
import { Users, Search, Edit, Plus, Trash2, Image, X, Settings, Gift, Star, Tag } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useRewards, createReward, updateReward, deleteReward, uploadRewardImage, deleteRewardImage } from '../hooks/useRewards';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AvatarWithPreview } from '../components/AvatarWithPreview';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-6">
      <div className="max-w-7xl mx-auto" style={{ padding: '32px 16px' }}>
        
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
          
          {/* Header com Gradiente */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />
            </div>
            
            {/* Header Content */}
            <div className="relative" style={{ padding: '32px 32px 28px 32px' }}>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <div 
                  className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                  style={{ width: '56px', height: '56px' }}
                >
                  <Settings style={{ width: '28px', height: '28px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
                </div>
                <div style={{ marginLeft: '4px' }}>
                  <h1 className="text-2xl md:text-3xl font-ranade font-bold tracking-tight drop-shadow-sm" style={{ color: 'white', marginBottom: '4px' }}>
                    Painel Administrativo
                  </h1>
                  <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px', lineHeight: '20px' }}>
                    Gerencie usuários e recompensas da plataforma
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div style={{ padding: '32px' }}>
            
            {/* Tabs Modernizadas */}
            <div 
              className="flex flex-wrap bg-slate-100/80 rounded-2xl w-fit"
              style={{ gap: '8px', padding: '6px', marginBottom: '28px' }}
            >
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-white text-lab-primary shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={{ gap: '8px', padding: '12px 20px', fontSize: '14px' }}
              >
                <Users style={{ width: '18px', height: '18px' }} />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'rewards'
                    ? 'bg-white text-lab-primary shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={{ gap: '8px', padding: '12px 20px', fontSize: '14px' }}
              >
                <Gift style={{ width: '18px', height: '18px' }} />
                Recompensas
              </button>
            </div>

            {/* Barra de Busca Modernizada */}
            <div style={{ marginBottom: '24px' }}>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  style={{ width: '20px', height: '20px' }}
                />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'users' ? 'Buscar usuários por nome ou email...' : 'Buscar recompensas...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 border-2 border-transparent focus:border-lab-primary focus:bg-white focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400"
                  style={{ paddingLeft: '48px', paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px', fontSize: '15px' }}
                />
              </div>
            </div>

            {activeTab === 'users' && (
              <div>
                {usersLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl animate-pulse" style={{ height: '96px' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="group flex items-center justify-between bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                        style={{ padding: '20px 24px' }}
                      >
                        <div className="flex items-center flex-1" style={{ gap: '16px' }}>
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
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <h3 className="font-ranade font-bold text-slate-900" style={{ fontSize: '15px', marginBottom: '4px' }}>{user.nome}</h3>
                            <p className="font-dm-sans text-slate-500" style={{ fontSize: '13px', marginBottom: '4px' }}>{user.email}</p>
                            <p className="font-dm-sans text-slate-400" style={{ fontSize: '12px' }}>
                              {user.department ? DEPARTMENT_LABELS[user.department] : 'Sem departamento'}
                            </p>
                          </div>
                          
                          {/* Points Badge Azul */}
                          <div 
                            className="hidden sm:flex items-center rounded-xl bg-gradient-to-r from-lab-light to-blue-50 border border-lab-primary/20"
                            style={{ gap: '10px', padding: '8px 14px' }}
                          >
                            <div 
                              className="rounded-lg bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-sm"
                              style={{ width: '28px', height: '28px' }}
                            >
                              <Star style={{ width: '14px', height: '14px' }} className="text-white" fill="white" />
                            </div>
                            <span className="font-ranade font-bold text-lab-primary" style={{ fontSize: '15px' }}>{user.lab_points}</span>
                          </div>
                          
                          {/* Role Badge */}
                          <span
                            className={`rounded-full font-dm-sans font-medium ${
                              user.role === 'adm'
                                ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700'
                                : user.role === 'gestor'
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            style={{ padding: '6px 14px', fontSize: '12px', flexShrink: 0 }}
                          >
                            {user.role === 'adm' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                          </span>
                        </div>
                        
                        {/* Edit Button */}
                        <div style={{ marginLeft: '16px', flexShrink: 0 }}>
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenUserEdit(user)}
                            className="!min-w-0 !rounded-xl hover:!bg-lab-light"
                            style={{ padding: '10px' }}
                          >
                            <Edit style={{ width: '18px', height: '18px' }} />
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
                {/* Botão Nova Recompensa */}
                <div style={{ marginBottom: '24px' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      resetRewardForm();
                      setShowRewardForm(true);
                    }}
                    className="!rounded-xl"
                    style={{ padding: '12px 20px' }}
                  >
                    <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Nova Recompensa
                  </Button>
                </div>

                {/* Formulário de Recompensa */}
                {(editingReward !== null || showRewardForm) && (
                  <div 
                    className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100"
                    style={{ padding: '28px', marginBottom: '24px' }}
                  >
                    {/* Form Header */}
                    <div className="flex items-center" style={{ gap: '14px', marginBottom: '24px' }}>
                      <div 
                        className="rounded-xl bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-md"
                        style={{ width: '44px', height: '44px' }}
                      >
                        <Gift style={{ width: '22px', height: '22px' }} className="text-white" />
                      </div>
                      <h3 className="font-ranade font-bold text-slate-800" style={{ fontSize: '18px' }}>
                        {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
                      </h3>
                    </div>
                    
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '20px', marginBottom: '24px' }}>
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
                      
                      {/* Image Upload Modernizado */}
                      <div>
                        <label 
                          className="block font-dm-sans font-medium text-slate-700"
                          style={{ fontSize: '14px', marginBottom: '8px' }}
                        >
                          Imagem da Recompensa
                        </label>
                        
                        {imagePreview ? (
                          <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full object-cover"
                              style={{ height: '144px' }}
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              disabled={savingReward}
                              className="absolute rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                              style={{ top: '8px', right: '8px', padding: '6px' }}
                            >
                              <X style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => !savingReward && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-slate-200 rounded-xl text-center transition-all duration-300 ${
                              savingReward ? 'opacity-50 cursor-not-allowed' : 'hover:border-lab-primary hover:bg-lab-light/30 cursor-pointer'
                            }`}
                            style={{ padding: '24px' }}
                          >
                            <div className="flex flex-col items-center" style={{ gap: '8px' }}>
                              <div 
                                className="rounded-xl bg-slate-100"
                                style={{ padding: '10px' }}
                              >
                                <Image style={{ width: '24px', height: '24px' }} className="text-slate-400" />
                              </div>
                              <p className="font-dm-sans text-slate-600" style={{ fontSize: '14px' }}>
                                Clique para upload
                              </p>
                              <p className="text-slate-400" style={{ fontSize: '12px' }}>
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

                      {/* Descrição */}
                      <div className="md:col-span-2">
                        <label 
                          className="block font-dm-sans font-medium text-slate-700"
                          style={{ fontSize: '14px', marginBottom: '8px' }}
                        >
                          Descrição
                        </label>
                        <textarea
                          value={rewardForm.descricao}
                          onChange={(e) =>
                            setRewardForm({ ...rewardForm, descricao: e.target.value })
                          }
                          rows={3}
                          className="w-full rounded-xl border-2 border-slate-200 focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 outline-none transition-all duration-200 font-dm-sans text-slate-800"
                          style={{ padding: '12px 16px', fontSize: '15px' }}
                          required
                        />
                      </div>
                      
                      {/* Checkbox Ativo */}
                      <div className="flex items-center" style={{ gap: '10px' }}>
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={rewardForm.ativo}
                          onChange={(e) =>
                            setRewardForm({ ...rewardForm, ativo: e.target.checked })
                          }
                          className="rounded text-lab-primary focus:ring-lab-primary"
                          style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="ativo" className="font-dm-sans text-slate-700" style={{ fontSize: '14px' }}>
                          Recompensa ativa
                        </label>
                      </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div 
                      className="border-t border-slate-100"
                      style={{ paddingTop: '20px', display: 'flex', gap: '12px' }}
                    >
                      <Button
                        variant="primary"
                        onClick={handleSaveReward}
                        loading={savingReward}
                        className="!rounded-xl"
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
                        className="!rounded-xl"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de Recompensas */}
                {rewardsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl animate-pulse" style={{ height: '120px' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="group flex items-center justify-between bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                        style={{ padding: '20px 24px' }}
                      >
                        <div className="flex items-center flex-1" style={{ gap: '16px', minWidth: 0 }}>
                          {/* Reward Image/Icon */}
                          <div 
                            className="rounded-xl overflow-hidden bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-md"
                            style={{ width: '64px', height: '64px', flexShrink: 0 }}
                          >
                            {reward.imagem_url ? (
                              <img 
                                src={reward.imagem_url} 
                                alt={reward.titulo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Tag style={{ width: '28px', height: '28px' }} className="text-white/70" />
                            )}
                          </div>
                          
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <h3 className="font-ranade font-bold text-slate-900" style={{ fontSize: '16px', marginBottom: '4px' }}>
                              {reward.titulo}
                            </h3>
                            <p className="font-dm-sans text-slate-500 line-clamp-1" style={{ fontSize: '14px', marginBottom: '8px' }}>
                              {reward.descricao}
                            </p>
                            <div className="flex items-center" style={{ gap: '12px' }}>
                              {/* Points Badge Azul */}
                              <div 
                                className="flex items-center rounded-lg bg-gradient-to-r from-lab-light to-blue-50 border border-lab-primary/20"
                                style={{ gap: '6px', padding: '4px 10px' }}
                              >
                                <Star style={{ width: '14px', height: '14px' }} className="text-lab-primary" fill="currentColor" />
                                <span className="font-ranade font-bold text-lab-primary" style={{ fontSize: '14px' }}>{reward.custo_points}</span>
                              </div>
                              <span 
                                className="font-dm-sans text-slate-400 rounded-lg bg-slate-100"
                                style={{ fontSize: '12px', padding: '4px 10px' }}
                              >
                                {reward.categoria}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center" style={{ gap: '10px', marginLeft: '16px', flexShrink: 0 }}>
                          <span
                            className={`rounded-full font-dm-sans font-medium ${
                              reward.ativo
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            {reward.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => handleEditReward(reward)}
                            className="!min-w-0 !rounded-xl hover:!bg-lab-light"
                            style={{ padding: '10px' }}
                          >
                            <Edit style={{ width: '18px', height: '18px' }} />
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteReward(reward.id)}
                            loading={deletingReward === reward.id}
                            className="!min-w-0 !rounded-xl"
                            style={{ padding: '10px' }}
                          >
                            <Trash2 style={{ width: '18px', height: '18px' }} />
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
