import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Mail, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoIcon from '../assets/logo/LAB POINTS LOGIN.png';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email é obrigatório');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      showToast('Erro ao enviar email de recuperação', 'error');
    } else {
      setSent(true);
      showToast('Email de recuperação enviado com sucesso', 'success');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-slate-100">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                <Check size={40} className="text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-ranade font-bold text-slate-900 mb-3">
                Email Enviado!
              </h2>
              <p className="text-slate-600 font-dm-sans leading-relaxed">
                Enviamos um link de recuperação para <strong className="text-slate-900">{email}</strong>
              </p>
              <p className="text-slate-500 font-dm-sans text-sm mt-4">
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>
            </div>

            {/* Back to Login */}
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 border-slate-200 text-slate-700 font-dm-sans font-semibold hover:border-lab-primary hover:text-lab-primary hover:bg-lab-primary/5 transition-all duration-300 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Esqueceu sua senha?
            </h1>
            <p className="text-xl text-white/80 font-dm-sans">
              Não se preocupe! Vamos te ajudar a recuperar o acesso à sua conta.
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-dm-sans font-medium mb-4">
              <Sparkles size={16} />
              <span>Recuperação de Senha</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-ranade font-bold text-slate-900 mb-2">
              Recuperar Acesso
            </h2>
            <p className="text-slate-500 font-dm-sans">
              Digite seu email para receber o link de recuperação
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
                    error
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-200 bg-white focus:border-lab-primary focus:ring-4 focus:ring-lab-primary/10 hover:border-slate-300'
                  }`}
                  autoComplete="email"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500 font-dm-sans flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}
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
                    <span className="text-white">Enviando...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Enviar Link de Recuperação</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-white" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link
              to="/login"
              className="text-slate-600 hover:text-lab-primary font-dm-sans inline-flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao Login
            </Link>
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
