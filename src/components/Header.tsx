import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Home, Gift, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { Avatar } from './ui/Avatar';
import { PointsBadge } from './ui/PointsBadge';
// @ts-ignore - asset import (PNG) may lack type declaration in project
import logoIcon from '../assets/logo/LAB POINT HEADER.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const points = usePoints();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                  Sistema de Recompensas
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
        <div className="min-h-[80px] sm:min-h-[96px] flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={logoIcon} 
                alt="Lab Points" 
                className="w-auto transition-all duration-300 group-hover:scale-110" 
                style={{ height: '60px' }}
              />
              <div className="absolute -inset-1 bg-lab-gradient opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-full" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-2xl font-bold bg-lab-gradient bg-clip-text text-transparent">
                Lab Points
              </span>
              <span className="text-xs text-lab-gray tracking-wide">
                {user.lab_points} pontos disponíveis
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-lab-gradient shadow-lab-sm'
                  : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
              }`}
            >
              <Home size={20} className={`transition-transform group-hover:scale-110 ${
                isActive('/dashboard') ? 'text-white' : ''
              }`} />
              <span className={`text-sm font-semibold ${
                isActive('/dashboard') ? 'text-white' : ''
              }`}>Início</span>
            </Link>
            
            <Link
              to="/recompensas"
              className={`group flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/recompensas')
                  ? 'bg-lab-gradient shadow-lab-sm'
                  : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
              }`}
            >
              <Gift size={20} className={`transition-transform group-hover:scale-110 ${
                isActive('/recompensas') ? 'text-white' : ''
              }`} />
              <span className={`text-sm font-semibold ${
                isActive('/recompensas') ? 'text-white' : ''
              }`}>Recompensas</span>
            </Link>

            {user.role === 'adm' && (
              <Link
                to="/admin"
                className={`group flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')
                    ? 'bg-lab-gradient shadow-lab-sm'
                    : 'text-lab-gray hover:text-lab-primary hover:bg-lab-light'
                }`}
              >
                <Settings size={20} className={`transition-transform group-hover:scale-110 ${
                  (isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')) ? 'text-white' : ''
                }`} />
                <span className={`text-sm font-semibold ${
                  (isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')) ? 'text-white' : ''
                }`}>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
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
                  size="lg" 
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
                          size="lg" 
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
              className="md:hidden p-2 hover:bg-lab-light rounded-xl transition-all duration-300"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-gray-200 animate-fade-in space-y-1">
            {/* Points Badge Mobile */}
            <div className="lg:hidden px-4 py-3 bg-gradient-to-r from-lab-light to-white rounded-xl mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-lab-gray">Seus pontos</span>
                <PointsBadge points={points} size="sm" />
              </div>
            </div>

            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/dashboard')
                  ? 'bg-lab-gradient text-white shadow-lab-sm'
                  : 'text-lab-gray hover:bg-lab-light hover:text-lab-primary'
              }`}
              onClick={closeMobileMenu}
            >
              <Home size={20} />
              <span className="font-semibold">Início</span>
            </Link>
            
            <Link
              to="/recompensas"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive('/recompensas')
                  ? 'bg-lab-gradient text-white shadow-lab-sm'
                  : 'text-lab-gray hover:bg-lab-light hover:text-lab-primary'
              }`}
              onClick={closeMobileMenu}
            >
              <Gift size={20} />
              <span className="font-semibold">Recompensas</span>
            </Link>

            {user.role === 'adm' && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-lab-gradient text-white shadow-lab-sm'
                    : 'text-lab-gray hover:bg-lab-light hover:text-lab-primary'
                }`}
                onClick={closeMobileMenu}
              >
                <Settings size={20} />
                <span className="font-semibold">Admin</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
