import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Menu, X, LogOut, User, Home, Gift, Settings, ChevronDown, Award, ClipboardCheck, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { usePointAssignments } from '../hooks/usePointAssignments';
import { Avatar } from './ui/Avatar';
import { useProfilePreview } from './UserProfilePreviewModal';
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
  const { openPreview } = useProfilePreview();
  
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
    <header className={`bg-white border-b border-gray-200 w-full sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lab-md backdrop-blur-lg bg-opacity-95' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="hidden md:flex items-center justify-center bg-lab-gradient text-white rounded-xl font-medium hover:shadow-lab-md hover:scale-105 transition-all duration-300"
                style={{
                  gap: '8px',
                  height: '40px',
                  padding: '0 14px',
                  fontSize: '14px',
                  lineHeight: 1,
                  whiteSpace: 'nowrap'
                }}
                title="Atribuir Pontos"
              >
                <Award size={18} style={{ color: 'white', flexShrink: 0 }} />
                <span className="hidden lg:inline" style={{ color: 'white', fontWeight: 600 }}>Atribuir Pontos</span>
              </button>
            )}

            {/* Pending Approvals Badge */}
            {canAssignPoints && (
              <Link
                to="/aprovacoes"
                className="relative hidden md:flex items-center gap-2 px-3 lg:px-4 rounded-xl transition-all duration-300"
                style={{
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.1) 100%)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.25)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(79,70,229,0.18) 100%)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.3)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.1) 100%)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.25)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)';
                }}
                title={pendingCount > 0 ? `${pendingCount} aprovação(ões) pendente(s)` : 'Central de Aprovações'}
              >
                <ClipboardCheck size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
                <span className="hidden lg:inline" style={{ fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>Aprovações</span>
                {pendingCount > 0 && (
                  <span style={{
                    width: '20px', height: '20px', flexShrink: 0,
                    background: '#ef4444', color: 'white',
                    fontSize: '11px', fontWeight: 700,
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }} className="animate-pulse">
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
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-300 group ${
                  userMenuOpen ? 'bg-lab-light ring-2 ring-lab-primary ring-opacity-30' : 'hover:bg-lab-light'
                }`}
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
                  <span className="text-sm font-semibold text-lab-black leading-tight">
                    {user.nome.split(' ')[0]}
                  </span>
                  <span className="text-xs text-lab-gray leading-tight">
                    {user.role === 'adm' ? 'Admin' : user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                  </span>
                </div>
                <ChevronDown 
                  size={15} 
                  className={`hidden lg:block text-lab-gray transition-transform duration-300 ${
                    userMenuOpen ? 'rotate-180 text-lab-primary' : ''
                  }`} 
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div
                    style={{
                      position: 'absolute', right: 0, marginTop: '8px', zIndex: 20,
                      width: '320px', borderRadius: '16px', overflow: 'hidden',
                      border: '1px solid rgba(203,213,225,0.8)',
                      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18), 0 8px 24px -6px rgba(0,0,0,0.1)'
                    }}>

                    {/* Gradient Header */}
                    <div style={{
                      position: 'relative', padding: '20px',
                      background: 'linear-gradient(135deg, var(--lab-primary) 0%, #6366f1 50%, #9333ea 100%)',
                      overflow: 'hidden'
                    }}>
                      {/* Decorative blobs */}
                      <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(24px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-16px', left: '-16px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(24px)', pointerEvents: 'none' }} />

                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Avatar 64x64px with click-to-preview */}
                        <div 
                          onClick={() => openPreview({
                            id: user.id,
                            nome: user.nome,
                            avatar_url: user.avatar_url ?? null,
                            lab_points: user.lab_points ?? 0,
                            department: user.department ?? null,
                            role: user.role,
                            created_at: user.created_at,
                          })}
                          style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '50%', 
                            border: '3px solid rgba(255,255,255,0.5)',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, border-color 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.nome}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>
                                {user.nome?.trim().split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: 'white', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginBottom: '2px' }}>{user.nome}</p>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginBottom: '8px' }}>{user.email}</p>
                          {/* Role badge */}
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '2px 10px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: 600,
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}>
                            {user.role === 'adm' ? '⚙ Admin' : user.role === 'gestor' ? '👥 Gestor' : '⭐ Colaborador'}
                          </span>
                        </div>
                      </div>

                      {/* Points pill */}
                      <div style={{
                        position: 'relative', marginTop: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '12px', padding: '10px 16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Award size={20} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', fontWeight: 500 }}>Seus pontos</span>
                        </div>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', lineHeight: 1, marginRight: '4px' }}>{(user.lab_points ?? 0).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div style={{ background: 'white', paddingTop: '8px', paddingBottom: '8px' }}>
                      <Link
                        to="/perfil"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={17} style={{ color: '#4f46e5' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Meu Perfil</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Gerencie suas informações</p>
                        </div>
                      </Link>

                      <div style={{ margin: '4px 16px', borderTop: '1px solid #f1f5f9' }} />

                      <button
                        onClick={handleSignOut}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(254,242,242,0.7)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LogOut size={17} style={{ color: '#ef4444' }} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', margin: 0 }}>Sair da conta</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Até logo!</p>
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
                  <Award style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.85)' }} />
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
                      backgroundColor: isActive('/aprovacoes') ? 'rgba(255,255,255,0.2)' : '#c7cffe' 
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
