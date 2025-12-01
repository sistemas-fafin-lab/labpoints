import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  children,
  loading = false,
  disabled,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-ranade font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

  const sizeClasses = {
    sm: 'min-h-[36px] px-4 py-2 text-sm rounded-lg',
    md: 'min-h-[44px] px-6 py-3 text-base rounded-lab',
    lg: 'min-h-[52px] px-8 py-4 text-lg rounded-lab',
  };

  const variantClasses = {
    primary: 'bg-lab-gradient text-white hover:shadow-lab-md hover:scale-[1.02] focus:ring-lab-primary shadow-lab-sm',
    secondary: 'bg-white text-lab-primary border-2 border-lab-primary hover:bg-lab-primary hover:text-white hover:shadow-lab-md focus:ring-lab-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500',
    ghost: 'bg-transparent text-lab-primary hover:bg-lab-primary hover:bg-opacity-10 focus:ring-lab-primary',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Carregando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
