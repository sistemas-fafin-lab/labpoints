import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-dm-sans font-medium text-lab-gray-700 mb-2 transition-colors"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-lab border-2 font-dm-sans
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-lab-primary focus:border-lab-primary focus:shadow-lab-sm
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-300 placeholder:text-gray-400
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 font-dm-sans animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
