import { useState } from 'react';
import { User as UserIcon, History, ChevronDown, HelpCircle, Sparkles, TrendingUp, TrendingDown, Gift, Calendar, Mail, Building2, Shield, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useRedemptions } from '../hooks/useRedemptions';
import { useToast } from '../components/ui/Toast';
import { useOnboardingContext } from '../components/OnboardingProvider';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import { PointsBadge } from '../components/ui/PointsBadge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { updateUser } from '../hooks/useUsers';
import { DEPARTMENTS_LIST, DEPARTMENT_LABELS, DepartmentEnum } from '../lib/supabase';

type Tab = 'info' | 'transactions' | 'redemptions';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions(user?.id);
  const { redemptions, loading: redemptionsLoading } = useRedemptions(user?.id);
  const { showToast } = useToast();
  const { resetTutorial } = useOnboardingContext();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome || '');
  const [department, setDepartment] = useState<DepartmentEnum | ''>(user?.department || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!nome.trim() || !department) {
      showToast('Nome e departamento são obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.id, { nome, department: department as DepartmentEnum });
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
    setDepartment(user.department || '');
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 overflow-hidden">
          
          {/* Header com Gradiente Modernizado */}
          <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />
            </div>
            
            {/* Header Content */}
            <div className="relative" style={{ padding: '32px 48px 96px 48px' }}>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <div 
                  className="rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg"
                  style={{ width: '56px', height: '56px' }}
                >
                  <Sparkles style={{ width: '28px', height: '28px' }} strokeWidth={2} className="drop-shadow-lg text-white" />
                </div>
                <div style={{ marginLeft: '4px' }}>
                  <h1 className="text-2xl md:text-3xl font-ranade font-bold tracking-tight drop-shadow-sm" style={{ color: 'white', marginBottom: '4px' }}>
                    Meu Perfil
                  </h1>
                  <p className="text-white/80 font-dm-sans" style={{ fontSize: '14px', lineHeight: '20px' }}>
                    Gerencie suas informações e acompanhe seu progresso
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card sobreposto */}
          <div className="relative z-10" style={{ padding: '0 24px', marginTop: '-64px' }}>
            <div 
              className="bg-white rounded-2xl shadow-lg border border-slate-100"
              style={{ padding: '32px' }}
            >
              <div className="flex flex-col md:flex-row items-center md:items-start" style={{ gap: '32px' }}>
                {/* Avatar com Photo Upload */}
                <div className="relative" style={{ flexShrink: 0 }}>
                  <div className="ring-4 ring-white shadow-xl rounded-full">
                    <ProfilePhotoUpload
                      userId={user.id}
                      currentAvatarUrl={user.avatar_url}
                      userName={user.nome}
                      size="xl"
                      editable={true}
                      onUploadComplete={() => {
                        refreshUser();
                        showToast('Foto atualizada com sucesso!', 'success');
                      }}
                    />
                  </div>
                  {/* Badge de Role */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 flex items-center rounded-full bg-gradient-to-r from-lab-primary to-indigo-500 text-white font-dm-sans font-medium shadow-md"
                    style={{ bottom: '-10px', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                  >
                    <Shield style={{ width: '12px', height: '12px' }} />
                    {user.role === 'adm' ? 'Admin' : 'Colaborador'}
                  </div>
                </div>

                {/* Info Principal */}
                <div className="flex-1 text-center md:text-left" style={{ minWidth: 0 }}>
                  <h2 
                    className="font-ranade font-bold text-slate-900"
                    style={{ fontSize: '24px', lineHeight: '32px', marginBottom: '8px' }}
                  >
                    {user.nome}
                  </h2>
                  
                  {/* Meta Info */}
                  <div 
                    className="flex flex-wrap items-center justify-center md:justify-start text-slate-600 font-dm-sans"
                    style={{ gap: '12px', fontSize: '14px', marginBottom: '20px' }}
                  >
                    <span className="flex items-center" style={{ gap: '6px' }}>
                      <Building2 style={{ width: '16px', height: '16px' }} className="text-slate-400" />
                      {user.department ? DEPARTMENT_LABELS[user.department] : 'Sem departamento'}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center" style={{ gap: '6px' }}>
                      <Mail style={{ width: '16px', height: '16px' }} className="text-slate-400" />
                      {user.email}
                    </span>
                  </div>
                  
                  {/* Points Badge - Design System Azul com Estrela */}
                  <div 
                    className="inline-flex items-center rounded-2xl bg-gradient-to-r from-lab-light to-blue-50 border border-lab-primary/20"
                    style={{ gap: '14px', padding: '12px 20px' }}
                  >
                    <div 
                      className="rounded-xl bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-md"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <Star style={{ width: '22px', height: '22px' }} className="text-white" fill="white" />
                    </div>
                    <div>
                      <p className="font-dm-sans text-lab-primary/70" style={{ fontSize: '12px', marginBottom: '2px' }}>LAB Points</p>
                      <p className="font-ranade font-bold text-lab-primary" style={{ fontSize: '22px', lineHeight: '26px' }}>{user.lab_points}</p>
                    </div>
                  </div>
                </div>

                {/* Data de Criação */}
                <div 
                  className="hidden lg:flex items-center text-slate-500 font-dm-sans"
                  style={{ gap: '8px', fontSize: '14px', flexShrink: 0 }}
                >
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  <span>Desde {new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px 24px 40px 24px' }}>
            {/* Tabs Modernizadas */}
            <div 
              className="flex flex-wrap bg-slate-100/80 rounded-2xl w-fit"
              style={{ gap: '8px', padding: '6px', marginBottom: '32px' }}
            >
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'info'
                    ? 'bg-white text-lab-primary shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={{ gap: '8px', padding: '12px 20px', fontSize: '14px' }}
              >
                <UserIcon style={{ width: '18px', height: '18px' }} />
                Informações
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'transactions'
                    ? 'bg-white text-lab-primary shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={{ gap: '8px', padding: '12px 20px', fontSize: '14px' }}
              >
                <History style={{ width: '18px', height: '18px' }} />
                Transações
              </button>

              <button
                onClick={() => setActiveTab('redemptions')}
                className={`flex items-center rounded-xl font-dm-sans font-medium transition-all duration-300 ${
                  activeTab === 'redemptions'
                    ? 'bg-white text-lab-primary shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                style={{ gap: '8px', padding: '12px 20px', fontSize: '14px' }}
              >
                <Gift style={{ width: '18px', height: '18px' }} />
                Meus Resgates
              </button>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Form Card */}
                <div 
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100"
                  style={{ padding: '28px' }}
                >
                  {/* Card Header */}
                  <div className="flex items-center" style={{ gap: '14px', marginBottom: '24px' }}>
                    <div 
                      className="rounded-xl bg-gradient-to-br from-lab-primary to-indigo-500 flex items-center justify-center shadow-md"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <UserIcon style={{ width: '22px', height: '22px' }} className="text-white" />
                    </div>
                    <h3 className="font-ranade font-bold text-slate-800" style={{ fontSize: '18px' }}>Dados Pessoais</h3>
                  </div>
                  
                  {/* Form Grid */}
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2"
                    style={{ gap: '20px', marginBottom: '24px' }}
                  >
                    <Input
                      label="Nome Completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={!editing}
                    />

                    {/* Department Select */}
                    <div>
                      <label 
                        className="block font-dm-sans font-medium text-slate-700"
                        style={{ fontSize: '14px', marginBottom: '8px' }}
                      >
                        Departamento
                      </label>
                      <div className="relative">
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value as DepartmentEnum)}
                          disabled={!editing}
                          className={`w-full rounded-xl border-2 appearance-none transition-all duration-200 font-dm-sans text-slate-800 ${
                            editing
                              ? 'bg-white border-slate-200 focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10'
                              : 'bg-slate-50 border-slate-100 cursor-not-allowed'
                          } outline-none`}
                          style={{ padding: '12px 44px 12px 16px', fontSize: '15px' }}
                        >
                          <option value="">Selecione seu departamento</option>
                          {DEPARTMENTS_LIST.map((dept) => (
                            <option key={dept.value} value={dept.value}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          className="text-slate-400 pointer-events-none"
                          style={{ width: '20px', height: '20px', right: '14px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                        />
                      </div>
                    </div>

                    <Input label="Email" value={user.email} disabled />

                    <Input
                      label="Membro desde"
                      value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                      disabled
                    />
                  </div>

                  {/* Actions */}
                  <div 
                    className="border-t border-slate-100"
                    style={{ paddingTop: '20px', display: 'flex', gap: '12px' }}
                  >
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

                {/* Tutorial Card */}
                <div 
                  className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100/50"
                  style={{ padding: '24px' }}
                >
                  <div className="flex items-center" style={{ gap: '14px', marginBottom: '16px' }}>
                    <div 
                      className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <HelpCircle style={{ width: '22px', height: '22px' }} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-ranade font-bold text-slate-800" style={{ fontSize: '16px', marginBottom: '2px' }}>Ajuda e Tutoriais</h3>
                      <p className="text-slate-500 font-dm-sans" style={{ fontSize: '14px' }}>Reveja o tutorial do sistema quando quiser</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      resetTutorial();
                      showToast('Tutorial reiniciado! Recarregue a página para vê-lo.', 'success');
                    }}
                    className="flex items-center bg-white hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 font-dm-sans font-medium transition-all duration-200 border border-indigo-200/50 hover:border-indigo-300 shadow-sm hover:shadow rounded-xl"
                    style={{ gap: '8px', padding: '12px 18px', fontSize: '14px' }}
                  >
                    <RefreshCw style={{ width: '18px', height: '18px' }} />
                    <span>Rever tutorial do sistema</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                {transactionsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl animate-pulse" style={{ height: '88px' }} />
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="group flex items-center justify-between bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300"
                        style={{ padding: '20px 24px' }}
                      >
                        <div className="flex items-center" style={{ gap: '16px' }}>
                          {/* Icon Container */}
                          <div 
                            className={`rounded-xl flex items-center justify-center shadow-md ${
                              transaction.tipo === 'credito'
                                ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                                : 'bg-gradient-to-br from-rose-400 to-red-500'
                            }`}
                            style={{ width: '48px', height: '48px', flexShrink: 0 }}
                          >
                            {transaction.tipo === 'credito' ? (
                              <TrendingUp style={{ width: '24px', height: '24px' }} className="text-white" />
                            ) : (
                              <TrendingDown style={{ width: '24px', height: '24px' }} className="text-white" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-dm-sans text-slate-900 font-medium" style={{ fontSize: '15px', marginBottom: '4px' }}>
                              {transaction.descricao}
                            </p>
                            <p className="font-dm-sans text-slate-500" style={{ fontSize: '13px' }}>
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right" style={{ marginLeft: '16px', flexShrink: 0 }}>
                          <p
                            className={`font-ranade font-bold ${
                              transaction.tipo === 'credito'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                            style={{ fontSize: '20px', lineHeight: '24px', marginBottom: '4px' }}
                          >
                            {transaction.tipo === 'credito' ? '+' : '-'}
                            {transaction.valor}
                          </p>
                          <span 
                            className={`inline-flex rounded-full font-dm-sans font-medium ${
                              transaction.tipo === 'credito'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            {transaction.tipo === 'credito' ? 'Crédito' : 'Débito'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: '80px 16px' }}>
                    <div 
                      className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto shadow-inner"
                      style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                    >
                      <History style={{ width: '40px', height: '40px' }} className="text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-dm-sans font-medium" style={{ fontSize: '18px', marginBottom: '4px' }}>
                      Nenhuma transação registrada
                    </p>
                    <p className="text-slate-400 font-dm-sans" style={{ fontSize: '14px' }}>
                      Suas transações aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'redemptions' && (
              <div>
                {redemptionsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl animate-pulse" style={{ height: '180px' }} />
                    ))}
                  </div>
                ) : redemptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
                    {redemptions.map((redemption) => (
                      <div
                        key={redemption.id}
                        className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Status Bar */}
                        <div className={`${
                          redemption.status === 'concluido'
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                            : redemption.status === 'pendente'
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                            : 'bg-gradient-to-r from-rose-400 to-red-500'
                        }`} style={{ height: '6px' }} />
                        
                        <div style={{ padding: '20px' }}>
                          {/* Header */}
                          <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                            <div className="flex items-center" style={{ gap: '12px' }}>
                              <div 
                                className={`rounded-xl flex items-center justify-center shadow-md ${
                                  redemption.status === 'concluido'
                                    ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                                    : redemption.status === 'pendente'
                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                                    : 'bg-gradient-to-br from-rose-400 to-red-500'
                                }`}
                                style={{ width: '40px', height: '40px', flexShrink: 0 }}
                              >
                                <Gift style={{ width: '20px', height: '20px' }} className="text-white" />
                              </div>
                              <h3 className="font-ranade font-bold text-slate-900" style={{ fontSize: '15px' }}>
                                {redemption.reward?.titulo || 'Recompensa'}
                              </h3>
                            </div>
                            <span
                              className={`rounded-full font-dm-sans font-medium ${
                                redemption.status === 'concluido'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : redemption.status === 'pendente'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                              style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
                            >
                              {redemption.status === 'concluido'
                                ? 'Concluído'
                                : redemption.status === 'pendente'
                                ? 'Pendente'
                                : 'Cancelado'}
                            </span>
                          </div>

                          {/* Description */}
                          <p 
                            className="font-dm-sans text-slate-500 line-clamp-2"
                            style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '16px' }}
                          >
                            {redemption.reward?.descricao}
                          </p>

                          {/* Footer */}
                          <div 
                            className="flex items-center justify-between border-t border-slate-100"
                            style={{ paddingTop: '14px' }}
                          >
                            <PointsBadge points={redemption.custo_points} size="sm" />
                            <p className="font-dm-sans text-slate-400 flex items-center" style={{ gap: '6px', fontSize: '12px' }}>
                              <Calendar style={{ width: '14px', height: '14px' }} />
                              {new Date(redemption.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: '80px 16px' }}>
                    <div 
                      className="rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center mx-auto shadow-inner"
                      style={{ width: '80px', height: '80px', marginBottom: '20px' }}
                    >
                      <Gift style={{ width: '40px', height: '40px' }} className="text-purple-300" />
                    </div>
                    <p className="text-slate-600 font-dm-sans font-medium" style={{ fontSize: '18px', marginBottom: '4px' }}>
                      Você ainda não resgatou nenhuma recompensa
                    </p>
                    <p className="text-slate-400 font-dm-sans" style={{ fontSize: '14px' }}>
                      Explore as recompensas disponíveis e comece a resgatar!
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
