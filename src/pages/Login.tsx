import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import logoIcon from '../assets/logo/LAB POINTS LOGIN.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
    <div className="min-h-screen bg-gradient-to-br from-lab-light via-white to-lab-primary-light flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full animate-scale-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-8 sm:mb-12">
            <img src={logoIcon} alt="Lab Points" className="h-48 sm:h-64 w-auto drop-shadow-lg" />
          </div>
          <p className="text-lab-gray text-sm sm:text-base mb-6">
            Entre com sua conta para acessar suas recompensas
          </p>
        </div>

        <div className="bg-white rounded-lab shadow-lab-md p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />

            <Input
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-6"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-dm-sans text-lab-gray-700">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="text-lab-primary font-semibold hover:text-lab-primary-dark transition-colors hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
