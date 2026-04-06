import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Menu, X, LogOut, User, Home, Gift, Settings, ChevronDown, Award, ClipboardCheck, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { usePointAssignments } from '../hooks/usePointAssignments';
import { Avatar } from './ui/Avatar';
import { PointsBadge } from './ui/PointsBadge';
import { AssignPointsModal } from './AssignPointsModal';
// @ts-ignore - asset import (PNG) may lack type declaration in project
import logoIcon from '../assets/logo/LAB POINT HEADER.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const points = usePoints();
  const location = useLocation();
  
  // Point assignments hook for managers and admins
  const {
    pendingCount,
    departmentUsers,
    loadingUsers,
    createAssignment
  } = usePointAssignments(user?.id);

  const isActive = (path: string) => location.pathname === path;
  const canAssignPoints = user?.role === 'gestor' || user?.role === 'adm';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!user) {
    return (
      <header className={`bg-white border-b border-gray-200 w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lab-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[80px] sm:min-h-[96px] flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src={logoIcon} 
                  alt="Lab Points" 
                  className="w-auto transition-all duration-300 group-hover:scale-110" 
                  style={{ height: '60px' }}
                />
                <div className="absolute -inset-1 bg-lab-gradient opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-full" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-2xl sm:text-3xl font-bold bg-lab-gradient bg-clip-text text-transparent">
                  Lab Points
                </span>
                <span className="text-xs sm:text-sm text-lab-gray tracking-wide">
                  Sistema de Reconhecimento
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 sm:px-6 py-2 sm:py-2.5 font-medium text-lab-primary hover:text-lab-primary-dark transition-all duration-300 text-sm sm:text-base rounded-lg hover:bg-lab-light"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="px-4 sm:px-6 py-2 sm:py-2.5 font-semibold bg-lab-gradient text-white rounded-lg hover:shadow-lab-md hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-white border-b border-gray-200 w-full sticky top-0 z-50 transition-all duration-300 overflow-x-hidden ${
      scrolled ? 'shadow-lab-md backdrop-blur-lg bg-opacity-95' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="min-h-[80px] sm:min-h-[96px] flex items-center justify-between py-3 gap-2">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <img 
                src={logoIcon} 
                alt="Lab Points" 
                className="w-auto transition-all duration-300 group-hover:scale-110 h-[44px] md:h-[50px] lg:h-[60px]" 
              />
              <div className="absolute -inset-1 bg-lab-gradient opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-full" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-2xl font-bold bg-lab-gradient bg-clip-text text-transparent">
                Lab Points
              </span>
              <span className="text-xs text-lab-gray tracking-wide">
                Nosso jeito de reconhecer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink min-w-0">
            <Link
              to="/dashboard"
              className={`group flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-lab-gradient shadow-lab-sm'
                  : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
              }`}
              title="Início"
            >
              <Home size={18} className={`transition-transform group-hover:scale-110 ${
                isActive('/dashboard') ? 'text-white' : ''
              }`} />
              <span className={`hidden lg:inline text-sm font-semibold ${
                isActive('/dashboard') ? 'text-white' : ''
              }`}>Início</span>
            </Link>
            
            <Link
              to="/recompensas"
              className={`group flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/recompensas')
                  ? 'bg-lab-gradient shadow-lab-sm'
                  : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
              }`}
              title="Recompensas"
            >
              <Gift size={18} className={`transition-transform group-hover:scale-110 ${
                isActive('/recompensas') ? 'text-white' : ''
              }`} />
              <span className={`hidden lg:inline text-sm font-semibold ${
                isActive('/recompensas') ? 'text-white' : ''
              }`}>Recompensas</span>
            </Link>

            {canAssignPoints && (
              <Link
                to="/controle-resgates"
                className={`group flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/controle-resgates')
                    ? 'bg-lab-gradient shadow-lab-sm'
                    : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
                }`}
                title="Resgates"
              >
                <Package size={18} className={`transition-transform group-hover:scale-110 ${
                  isActive('/controle-resgates') ? 'text-white' : ''
                }`} />
                <span className={`hidden lg:inline text-sm font-semibold ${
                  isActive('/controle-resgates') ? 'text-white' : ''
                }`}>Resgates</span>
              </Link>
            )}

            {user.role === 'adm' && (
              <Link
                to="/admin"
                className={`group flex items-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')
                    ? 'bg-lab-gradient shadow-lab-sm'
                    : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
                }`}
                title="Admin"
              >
                <Settings size={18} className={`transition-transform group-hover:scale-110 ${
                  (isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')) ? 'text-white' : ''
                }`} />
                <span className={`hidden lg:inline text-sm font-semibold ${
                  (isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')) ? 'text-white' : ''
                }`}>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Assign Points Button - Managers and Admins only */}
            {canAssignPoints && (
              <button
                onClick={() => setAssignModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-lab-gradient text-white rounded-xl font-medium text-sm hover:shadow-lab-md hover:scale-105 transition-all duration-300"
                title="Atribuir Pontos"
              >
                <Award size={18} className="text-white" />
                <span className="hidden lg:inline text-white">Atribuir Pontos</span>
              </button>
            )}

            {/* Pending Approvals Badge */}
            {canAssignPoints && (
              <Link
                to="/aprovacoes"
                className="relative hidden md:flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-300 transition-all duration-300 group"
                title={pendingCount > 0 ? `${pendingCount} aprovação(ões) pendente(s)` : 'Central de Aprovações'}
              >
                <ClipboardCheck size={18} className="text-amber-600 flex-shrink-0" />
                <span className="hidden lg:inline text-sm font-semibold text-amber-700">Aprovações</span>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            )}

            {/* Points Badge - Desktop */}
            <div className="hidden lg:block">
              <div className="px-4 py-2.5 bg-gradient-to-r from-lab-light to-white rounded-xl border border-lab-primary border-opacity-20">
                <PointsBadge points={points} size="md" animated />
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-lab-light transition-all duration-300 group"
                aria-label="Menu do usuário"
                aria-expanded={userMenuOpen}
              >
                <Avatar 
                  src={user.avatar_url} 
                  alt={user.nome} 
                  size="sm" 
                  fallbackText={user.nome} 
                />
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-semibold text-lab-black">
                    {user.nome.split(' ')[0]}
                  </span>
                  <span className="text-xs text-lab-gray">
                    {user.role === 'adm' ? 'Admin' : 'Colaborador'}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`hidden lg:block text-lab-gray transition-transform duration-300 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 bg-white rounded-2xl shadow-2xl py-2 z-20 animate-scale-in w-72 border border-gray-100 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-lab-light to-white border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar 
                          src={user.avatar_url} 
                          alt={user.nome} 
                          size="md" 
                          fallbackText={user.nome} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lab-black truncate">{user.nome}</p>
                          <p className="text-sm text-lab-gray truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-lab-primary border-opacity-20">
                        <span className="text-xs font-medium text-lab-gray">Seus pontos</span>
                        <PointsBadge points={user.lab_points} size="sm" />
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/perfil"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-lab-light transition-all duration-300 group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="p-2 rounded-lg bg-lab-light group-hover:bg-lab-primary group-hover:bg-opacity-10 transition-colors">
                          <User size={18} className="text-lab-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-lab-black">Meu Perfil</p>
                          <p className="text-xs text-lab-gray">Gerencie suas informações</p>
                        </div>
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-300 group"
                      >
                        <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                          <LogOut size={18} className="text-red-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-red-600">Sair da conta</p>
                          <p className="text-xs text-lab-gray">Até logo!</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-lab-light rounded-xl transition-all duration-300 relative z-[60]"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-lab-primary" />
              ) : (
                <Menu size={24} className="text-lab-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Full Screen Overlay (Portal to bypass backdrop-filter stacking context) */}
      {mobileMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
            onClick={closeMobileMenu}
          />
          
          {/* Slide-in Menu Panel */}
          <nav 
            className="md:hidden fixed bg-white shadow-2xl animate-slide-in-right overflow-y-auto"
            style={{ 
              top: 0, 
              right: 0, 
              height: '100vh', 
              width: '85vw', 
              maxWidth: '320px',
              zIndex: 9999 
            }}
          >
            {/* User Header */}
            <div 
              className="bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600"
              style={{ padding: '32px 24px 24px 24px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  border: '2px solid rgba(255,255,255,0.5)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '22px' }}>
                        {user.nome?.trim().split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: 'white', fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.nome}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              
              {/* Points Display */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                borderRadius: '12px', 
                padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award style={{ width: '20px', height: '20px', color: '#fde047' }} />
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>Seus pontos</span>
                </div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>{points.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>Navegação</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link
                  to="/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    background: isActive('/dashboard') ? 'linear-gradient(to right, var(--lab-primary), #6366f1)' : 'transparent',
                    color: isActive('/dashboard') ? 'white' : '#334155',
                    boxShadow: isActive('/dashboard') ? '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.25)' : 'none'
                  }}
                  onClick={closeMobileMenu}
                >
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : '#f1f5f9' 
                  }}>
                    <Home style={{ width: '20px', height: '20px', color: isActive('/dashboard') ? 'white' : 'var(--lab-primary)' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'inherit' }}>Início</span>
                </Link>
                
                <Link
                  to="/recompensas"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    background: isActive('/recompensas') ? 'linear-gradient(to right, var(--lab-primary), #6366f1)' : 'transparent',
                    color: isActive('/recompensas') ? 'white' : '#334155',
                    boxShadow: isActive('/recompensas') ? '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.25)' : 'none'
                  }}
                  onClick={closeMobileMenu}
                >
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: isActive('/recompensas') ? 'rgba(255,255,255,0.2)' : '#f1f5f9' 
                  }}>
                    <Gift style={{ width: '20px', height: '20px', color: isActive('/recompensas') ? 'white' : 'var(--lab-primary)' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'inherit' }}>Recompensas</span>
                </Link>

                <Link
                  to="/perfil"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    background: isActive('/perfil') ? 'linear-gradient(to right, var(--lab-primary), #6366f1)' : 'transparent',
                    color: isActive('/perfil') ? 'white' : '#334155',
                    boxShadow: isActive('/perfil') ? '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.25)' : 'none'
                  }}
                  onClick={closeMobileMenu}
                >
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: isActive('/perfil') ? 'rgba(255,255,255,0.2)' : '#f1f5f9' 
                  }}>
                    <User style={{ width: '20px', height: '20px', color: isActive('/perfil') ? 'white' : 'var(--lab-primary)' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'inherit' }}>Meu Perfil</span>
                </Link>
              </div>
            </div>

            {/* Manager/Admin Section */}
            {canAssignPoints && (
              <div style={{ padding: '0 16px 16px 16px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>Gestão</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link
                    to="/controle-resgates"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      background: isActive('/controle-resgates') ? 'linear-gradient(to right, var(--lab-primary), #6366f1)' : 'transparent',
                      color: isActive('/controle-resgates') ? 'white' : '#334155',
                      boxShadow: isActive('/controle-resgates') ? '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.25)' : 'none'
                    }}
                    onClick={closeMobileMenu}
                  >
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      backgroundColor: isActive('/controle-resgates') ? 'rgba(255,255,255,0.2)' : '#f1f5f9' 
                    }}>
                      <Package style={{ width: '20px', height: '20px', color: isActive('/controle-resgates') ? 'white' : 'var(--lab-primary)' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: 'inherit' }}>Controle de Resgates</span>
                  </Link>

                  <Link
                    to="/aprovacoes"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      background: isActive('/aprovacoes') ? 'linear-gradient(to right, #f59e0b, #f97316)' : 'transparent',
                      color: isActive('/aprovacoes') ? 'white' : '#334155',
                      boxShadow: isActive('/aprovacoes') ? '0 10px 15px -3px rgba(245, 158, 11, 0.25)' : 'none'
                    }}
                    onClick={closeMobileMenu}
                  >
                    <div style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      backgroundColor: isActive('/aprovacoes') ? 'rgba(255,255,255,0.2)' : '#fef3c7' 
                    }}>
                      <ClipboardCheck style={{ width: '20px', height: '20px', color: isActive('/aprovacoes') ? 'white' : '#d97706' }} />
                    </div>
                    <span style={{ fontWeight: 600, flex: 1, color: 'inherit' }}>Aprovações</span>
                    {pendingCount > 0 && (
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#ef4444', 
                        color: 'white', 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </Link>

                  {user.role === 'adm' && (
                    <Link
                      to="/admin"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        background: isActive('/admin') ? 'linear-gradient(to right, var(--lab-primary), #6366f1)' : 'transparent',
                        color: isActive('/admin') ? 'white' : '#334155',
                        boxShadow: isActive('/admin') ? '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.25)' : 'none'
                      }}
                      onClick={closeMobileMenu}
                    >
                      <div style={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.2)' : '#f1f5f9' 
                      }}>
                        <Settings style={{ width: '20px', height: '20px', color: isActive('/admin') ? 'white' : 'var(--lab-primary)' }} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'inherit' }}>Admin</span>
                    </Link>
                  )}
                </div>

                {/* Assign Points Button */}
                <button
                  onClick={() => {
                    setAssignModalOpen(true);
                    closeMobileMenu();
                  }}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: 'linear-gradient(to right, var(--lab-primary), #6366f1)',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(var(--lab-primary-rgb), 0.3)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Award style={{ width: '20px', height: '20px', color: 'white' }} />
                  <span style={{ color: 'white' }}>Atribuir Pontos</span>
                </button>
              </div>
            )}

            {/* Logout Section */}
            <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => {
                  handleSignOut();
                  closeMobileMenu();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 500,
                  color: '#dc2626',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef2f2' }}>
                  <LogOut style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                </div>
                <span style={{ fontWeight: 600, color: 'inherit' }}>Sair da conta</span>
              </button>
            </div>
          </nav>
        </>,
        document.body
      )}

      {/* Assign Points Modal */}
      <AssignPointsModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        users={departmentUsers}
        loadingUsers={loadingUsers}
        onSubmit={createAssignment}
      />
    </header>
  );
}
