import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { DEPARTMENTS_LIST, DepartmentEnum } from '../lib/supabase';
import { Mail, Lock, User, Building2, ArrowRight, ArrowLeft, Sparkles, Eye, EyeOff, CheckCircle2, Shield, Zap, X, AlertTriangle, Inbox } from 'lucide-react';
import logoIcon from '../assets/logo/LAB POINTS LOGIN.png';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [department, setDepartment] = useState<DepartmentEnum | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    nome?: string;
    department?: string;
  }>({});

  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateStep1 = () => {
    const newErrors: typeof errors = {};

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (nome.length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!department) {
      newErrors.department = 'Departamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: typeof errors = {};

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

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);

    const { error } = await signUp(email, password, nome, department as DepartmentEnum);

    if (error) {
      showToast(error.message || 'Erro ao criar conta', 'error');
      setLoading(false);
    } else {
      setLoading(false);
      setShowEmailConfirmModal(true);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: 'Fraca', color: 'bg-red-500' };
    if (password.length < 8) return { level: 2, text: 'Média', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: 'Forte', color: 'bg-green-500' };
    }
    return { level: 2, text: 'Média', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Dots Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
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
              Junte-se a nós!
            </h1>
            <p className="text-xl text-white/80 font-dm-sans mb-12">
              Crie sua conta e comece a acumular pontos por suas conquistas.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-ranade font-semibold text-white">Cadastro Rápido</p>
                  <p className="text-sm text-white/70 font-dm-sans">Em menos de 2 minutos você está dentro</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  <Shield size={28} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-ranade font-semibold text-white">100% Seguro</p>
                  <p className="text-sm text-white/70 font-dm-sans">Seus dados estão protegidos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15">
                <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  <Zap size={28} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-ranade font-semibold text-white">Comece a Ganhar</p>
                  <p className="text-sm text-white/70 font-dm-sans">Pontos desde o primeiro dia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L48 65C96 70 192 80 288 85C384 90 480 90 576 82.5C672 75 768 60 864 55C960 50 1056 55 1152 62.5C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="white" fillOpacity="0.1"/>
          </svg>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logoIcon} alt="Lab Points" className="h-44 w-auto" />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-dm-sans font-medium mb-4">
              <Sparkles size={16} />
              <span>Novo por aqui?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-ranade font-bold text-slate-900 mb-2">
              Criar sua conta
            </h2>
            <p className="text-slate-500 font-dm-sans">
              Passo {step} de 2 • {step === 1 ? 'Informações pessoais' : 'Credenciais de acesso'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'}`} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                    Nome Completo
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'nome' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'nome' ? 'text-lab-primary' : 'text-slate-400'
                    }`}>
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      onFocus={() => setFocusedField('nome')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Seu nome completo"
                      className={`w-full pl-14 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 font-dm-sans text-slate-800 placeholder:text-slate-400 outline-none ${
                        errors.nome
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                      }`}
                      autoComplete="name"
                    />
                  </div>
                  {errors.nome && (
                    <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Department Field */}
                <div>
                  <label className="block text-sm font-dm-sans font-semibold text-slate-700 mb-2">
                    Departamento
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'department' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
                      focusedField === 'department' ? 'text-lab-primary' : 'text-slate-400'
                    }`}>
                      <Building2 size={20} />
                    </div>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as DepartmentEnum)}
                      onFocus={() => setFocusedField('department')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-14 pr-12 py-4 rounded-2xl border-2 appearance-none transition-all duration-300 font-dm-sans text-slate-800 outline-none cursor-pointer ${
                        errors.department
                          ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                          : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                      } ${!department ? 'text-slate-400' : ''}`}
                    >
                      <option value="">Selecione seu departamento</option>
                      {DEPARTMENTS_LIST.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full relative group overflow-hidden rounded-2xl py-4 px-6 font-ranade font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                    <span className="text-white">Continuar</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-white" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </>
            ) : (
              <>
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
                      placeholder="Mínimo 6 caracteres"
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
                  
                  {/* Password Strength */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength.level >= level ? passwordStrength.color : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-dm-sans ${
                        passwordStrength.level === 1 ? 'text-red-500' :
                        passwordStrength.level === 2 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        Força da senha: {passwordStrength.text}
                      </p>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 px-6 rounded-2xl font-ranade font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    <span>Voltar</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] relative group overflow-hidden rounded-2xl py-4 px-6 font-ranade font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-white">Criando...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white">Criar Conta</span>
                          <Sparkles size={20} className="text-white" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Summary Card (Step 2) */}
          {step === 2 && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
              <p className="text-xs text-slate-500 font-dm-sans mb-2">Resumo do cadastro</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {nome.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-ranade font-semibold text-slate-800 text-sm">{nome || 'Nome'}</p>
                  <p className="text-xs text-slate-500 font-dm-sans">
                    {DEPARTMENTS_LIST.find(d => d.value === department)?.label || 'Departamento'}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-600 font-dm-sans">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-lab-primary hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group"
              >
                Fazer login
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-dm-sans">
              Ao criar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </div>
        </div>
      </div>

      {/* Email Confirmation Modal */}
      {showEmailConfirmModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => {}}
          style={{ margin: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in" />
          
          {/* Modal Container */}
          <div className="relative z-10 flex items-center justify-center w-full max-h-screen overflow-y-auto py-8">
            {/* Modal */}
            <div 
              className="relative bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 animate-scale-in my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-lab-primary via-indigo-500 to-purple-600 p-7 text-white overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
                </div>
                
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailConfirmModal(false);
                    navigate('/login');
                  }}
                  className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm cursor-pointer"
                  aria-label="Fechar modal"
                >
                  <X size={18} strokeWidth={2.5} className="text-white" />
                </button>
                
                <div className="relative flex items-center gap-5 pr-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <Mail size={32} strokeWidth={2} className="drop-shadow-lg text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-ranade font-bold tracking-tight drop-shadow-sm text-white">Quase lá!</h2>
                    <p className="text-white/90 text-sm font-dm-sans mt-0.5">
                      Confirme seu cadastro
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-ranade font-bold text-slate-800">
                    Conta criada com sucesso!
                  </h3>
                  <p className="text-slate-600 font-dm-sans text-sm leading-relaxed">
                    Enviamos um e-mail de confirmação para <span className="font-semibold text-lab-primary">{email}</span>. 
                    Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
                  </p>
                </div>

                {/* Spam Warning */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-ranade font-semibold text-amber-800 text-sm">
                      Não encontrou o e-mail?
                    </p>
                    <p className="text-amber-700 font-dm-sans text-xs mt-1">
                      Verifique também sua <span className="font-semibold">caixa de spam</span> ou lixo eletrônico. Às vezes, o e-mail pode demorar alguns minutos para chegar.
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Inbox size={20} className="text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-ranade font-semibold text-sky-800 text-sm">
                      Próximos passos
                    </p>
                    <p className="text-sky-700 font-dm-sans text-xs mt-1">
                      Após confirmar seu e-mail, você poderá fazer login e começar a acumular pontos.
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailConfirmModal(false);
                    navigate('/login');
                  }}
                  className="w-full relative group overflow-hidden rounded-2xl py-4 px-6 font-ranade font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                    <span className="text-white">Ir para o Login</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-white" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
