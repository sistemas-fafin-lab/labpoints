import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../hooks/usePoints';
import { Avatar } from './ui/Avatar';
import { PointsBadge } from './ui/PointsBadge';
// @ts-ignore - asset import (PNG) may lack type declaration in project
import logoIcon from '../assets/logo/LAB POINT CLASSIC PNG.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const points = usePoints();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  if (!user) {
    return (
      <header className="bg-lab-blue text-white shadow-lab-md w-full">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-90 lab-transition">
            <img src={logoIcon} alt="Lab Points" className="h-32 w-32" />
            <span className="text-3xl font-semibold tracking-tight text-white">Lab Points</span>
          </Link>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 font-medium text-white hover:bg-white hover:bg-opacity-10 rounded-lab lab-transition"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="px-5 py-2.5 font-medium bg-white text-lab-blue rounded-lab hover:bg-opacity-90 lab-transition"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-lab-blue text-white shadow-lab-md w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-38 md:h-38 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-90 lab-transition">
            <img src={logoIcon} alt="Lab Points" className="h-32 w-32" />
            <span className="text-3xl font-semibold tracking-tight text-white hidden sm:inline">Lab Points</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-1 rounded-lab font-medium text-white lab-transition max-w-fit ${
                isActive('/dashboard')
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <LayoutDashboard size={20} strokeWidth={2} />
              Dashboard
            </Link>
            <Link
              to="/recompensas"
              className={`flex items-center gap-2 px-4 py-1 rounded-lab font-medium text-white lab-transition ${
                isActive('/recompensas')
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <img src={logoIcon} alt="" className="h-5 w-5" />
              Recompensas
            </Link>
            {user.role === 'adm' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-1 rounded-lab font-medium text-white lab-transition ${
                  isActive('/admin') || isActive('/admin/usuarios') || isActive('/admin/recompensas')
                    ? 'bg-white bg-opacity-20'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Settings size={20} strokeWidth={2} />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4 text-white">
            <PointsBadge points={points} size="sm" key="points-badge" />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-white hover:bg-opacity-10 rounded-lab p-2 lab-transition text-white"
                aria-label="Menu do usuário"
                aria-expanded={userMenuOpen}
              >
                <Avatar src={user.avatar_url} alt={user.nome} size="sm" fallbackText={user.nome} />
                <span className="hidden md:inline font-medium text-white text-bold">{user.nome.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 bg-white rounded-lab shadow-lab-lg py-3 z-20 animate-scale-in flex flex-col w-auto min-w-[16rem] max-w-[22rem]">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray">{user.nome}</p>
                      <p className="text-sm text-gray">{user.email}</p>
                      <p className="text-xs text-gray mt-1">
                        {user.role === 'adm' ? 'Administrador' : 'Colaborador'}
                      </p>
                    </div>

                    <Link
                      to="/perfil"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-lab-light lab-transition text-gray"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={18} strokeWidth={2} />
                      Meu Perfil
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-lab-light lab-transition w-full text-left text-lab-coral"
                    >
                      <LogOut size={18} strokeWidth={2} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 rounded-lab transition-colors text-white"
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-white border-opacity-20 animate-slide-in">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lab font-medium text-white lab-transition ${
                isActive('/dashboard')
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={20} strokeWidth={2} />
              Dashboard
            </Link>
            <Link
              to="/recompensas"
              className={`flex items-center gap-2 px-4 py-2 rounded-lab font-medium text-white lab-transition ${
                isActive('/recompensas')
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <img src={logoIcon} alt="" className="h-5 w-5" />
              Recompensas
            </Link>
            {user.role === 'adm' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lab font-medium text-white lab-transition ${
                  isActive('/admin')
                    ? 'bg-white bg-opacity-20'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={20} strokeWidth={2} />
                Admin
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
