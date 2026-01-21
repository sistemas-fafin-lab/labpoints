import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, Gift, Star, Trophy } from 'lucide-react';
import logoIcon from '../assets/logo/LAB POINTS LOGIN.png';
import logoMobile from '../assets/logo/LAB POINTS LOGIN MOBILE.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [colabHovered, setColabHovered] = useState(false);

  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      showToast(error.message || 'Erro ao fazer login', 'error');
      setLoading(false);
    } else {
      showToast('Login realizado com sucesso', 'success');
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page-container min-h-screen flex">
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
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white min-h-screen">
          <div className="max-w-md text-center flex flex-col justify-center flex-1 py-8">
            {/* Logo */}
            <div className="mb-16 mt-16 flex justify-center">
              <div className="relative">
                <img src={logoIcon} alt="Lab Points" className="h-60 w-auto drop-shadow-2xl" />
                <div className="absolute -inset-4 rounded-full blur-2xl -z-10" />
              </div>
            </div>

            <h1 className="text-3xl font-ranade font-bold mb-6 text-white drop-shadow-lg">
              Bem-vindo(a), <span 
                className="relative inline-block group cursor-pointer"
                onMouseEnter={() => setColabHovered(true)}
                onMouseLeave={() => setColabHovered(false)}
              >
                <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent bg-[length:200%_100%] group-hover:animate-shimmer transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  Colab!
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/60 group-hover:w-full transition-all duration-500 rounded-full" />
              </span>
            </h1>
            <p className="text-lg text-white/80 font-dm-sans mb-12 leading-relaxed">
              Acumule pontos, conquiste recompensas e celebre suas conquistas.
            </p>

            {/* Container for Feature Cards and Tooltip - same space */}
            <div className="relative min-h-[320px]">
              {/* Feature Cards */}
              <div className={`absolute inset-0 space-y-5 transition-all duration-500 ease-out ${colabHovered ? 'opacity-0 scale-95 blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10 cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                    <Gift size={28} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-ranade font-semibold text-white transition-all duration-300 group-hover:scale-105">Recompensas Exclusivas</p>
                    <p className="text-sm text-white/70 font-dm-sans">Troque seus pontos por prêmios incríveis</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10 cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                    <Star size={28} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-ranade font-semibold text-white transition-all duration-300 group-hover:scale-105">Reconhecimento</p>
                    <p className="text-sm text-white/70 font-dm-sans">Seja valorizado pelo seu desempenho</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10 cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
                    <Trophy size={28} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-ranade font-semibold text-white transition-all duration-300 group-hover:scale-105">Conquistas</p>
                    <p className="text-sm text-white/70 font-dm-sans">Acompanhe seu progresso e metas</p>
                  </div>
                </div>
              </div>

              {/* Colab Tooltip - appears in same space */}
              <div className={`absolute inset-0 transition-all duration-500 ease-out ${colabHovered ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm pointer-events-none'}`}>
                <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl shadow-black/20 overflow-hidden h-full">
                  {/* Gradient Decorations */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl" />
                  
                  <div className="relative p-5 h-full flex flex-col justify-center">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <h3 className="text-lg font-ranade font-bold text-white leading-tight">
                        O que é ser um Colab?
                      </h3>
                    </div>
                    
                    {/* Body */}
                    <div className="space-y-2.5 text-left">
                      <p className="text-sm text-white font-dm-sans font-semibold leading-snug">
                        Ser Colab é ser protagonista no Lab.
                      </p>
                      
                      <div className="space-y-1.5">
                        <p className="text-xs text-white/85 font-dm-sans leading-relaxed">
                          É trabalhar em time, colocando o cliente sempre no centro.
                        </p>
                        <p className="text-xs text-white/85 font-dm-sans leading-relaxed">
                          É assumir responsabilidade, agir com espírito empreendedor e praticar a empatia no dia a dia.
                        </p>
                        <p className="text-xs text-white/85 font-dm-sans leading-relaxed">
                          É buscar constante evolução, aprendendo e melhorando a cada entrega.
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t border-white/20">
                        <p className="text-sm text-white/75 font-dm-sans italic leading-relaxed mt-2">
                          No labpoints, cada atitude conta. Aqui, reconhecemos quem vive nossos valores.
                        </p>
                      </div>
                      
                      {/* Footer Quote */}
                      <div className="pt-2.5 flex items-center justify-center gap-2.5">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        <p className="text-sm font-ranade font-bold text-white whitespace-nowrap drop-shadow-lg">
                          Ser colab é ser lab.
                        </p>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logoMobile} alt="Lab Points" className="h-36 w-auto mb-16 mt-8" />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lab-primary/10 text-lab-primary text-sm font-dm-sans font-medium mb-8">
              <Sparkles size={16} />
              <span>Sistema de Reconhecimento</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-ranade font-bold text-slate-900 mb-2">
              Entrar na sua conta
            </h2>
            <p className="text-slate-500 font-dm-sans">
              Acesse sua conta para gerenciar seus pontos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-lab-primary' : 'text-slate-400'
                }`}>
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="seu@email.com"
                  className={`w-full pl-14 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 outline-none ${
                    errors.email
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                Senha
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/esqueci-senha"
                className="text-sm font-dm-sans font-medium text-lab-primary hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group"
              >
                Esqueci minha senha
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl py-4 px-6 font-ranade font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-white">Entrando...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Entrar</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-white" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gradient-to-br from-slate-50 to-white text-sm text-slate-500 font-dm-sans">
                ou
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-600 font-dm-sans">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="font-semibold text-lab-primary hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group"
              >
                Cadastre-se agora!
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

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
