import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Lock, Eye, EyeOff, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoIcon from '../assets/logo/LAB POINTS LOGIN.png';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há um hash de recuperação na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type !== 'recovery') {
      showToast('Link de recuperação inválido ou expirado', 'error');
      navigate('/login');
    }
  }, [navigate, showToast]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      showToast(error.message || 'Erro ao redefinir senha', 'error');
    } else {
      showToast('Senha redefinida com sucesso!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;

    if (strength <= 2) return { strength, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Média', color: 'bg-yellow-500' };
    return { strength, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <img src={logoIcon} alt="Lab Points" className="h-56 w-auto drop-shadow-2xl" />
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>

            <h1 className="text-4xl font-ranade font-bold mb-4 text-white drop-shadow-lg">
              Redefinir Senha
            </h1>
            <p className="text-xl text-white/80 font-dm-sans">
              Crie uma nova senha forte e segura para sua conta.
            </p>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoIcon} alt="Lab Points" className="h-44 w-auto" />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-dm-sans font-medium mb-4">
              <Sparkles size={16} />
              <span>Nova Senha</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-ranade font-bold text-slate-900 mb-2">
              Crie uma Nova Senha
            </h2>
            <p className="text-slate-500 font-dm-sans">
              Escolha uma senha forte para proteger sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                Nova Senha
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-lab-primary' : 'text-slate-400'
                }`}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className={`w-full pl-14 pr-14 py-4 rounded-2xl border-2 transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 outline-none ${
                    errors.password
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-dm-sans font-semibold text-slate-600">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                Confirmar Senha
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'confirmPassword' ? 'text-lab-primary' : 'text-slate-400'
                }`}>
                  <CheckCircle size={20} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className={`w-full pl-14 pr-14 py-4 rounded-2xl border-2 transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 outline-none ${
                    errors.confirmPassword
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl py-4 px-6 font-ranade font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-white">Redefinindo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="text-white" />
                    <span className="text-white">Redefinir Senha</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-dm-sans">
              © 2025 Lab Points. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
