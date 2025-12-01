/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nova paleta Lab Points
        'lab-blue': '#3E6BF7',
        'lab-blue-dark': '#2E53C8',
        'lab-blue-light': '#E6EEFF',
        'lab-coral': '#FF6C6C',
        'lab-coral-hover': '#FF5252',
        'lab-light': '#F5F8FF',
        'lab-gray': '#5E5E5E',
        'lab-gray-light': '#A8A8A8',
        'lab-white': '#FFFFFF',
        'lab-black': '#1A1A1A',
        
        // Mantendo compatibilidade com código antigo
        'lab-primary': '#3E6BF7',
        'lab-primary-dark': '#2E53C8',
        'lab-accent': '#FF6C6C',
        'lab-gray-100': '#F5F8FF',
        'lab-gray-700': '#5E5E5E',
      },
      backgroundImage: {
        'lab-gradient': 'linear-gradient(90deg, #3E6BF7 0%, #2E53C8 100%)',
        'lab-gradient-hover': 'linear-gradient(90deg, #2E53C8 0%, #1E43A8 100%)',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        // Aliases para compatibilidade
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
        'ranade': ['Montserrat', 'sans-serif'],
        'dm-sans': ['Montserrat', 'sans-serif'],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        'lab': '12px',
        'lab-sm': '8px',
        'lab-lg': '20px',
        'lab-modal': '20px',
        'lab-full': '9999px',
      },
      boxShadow: {
        'lab-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'lab-md': '0 4px 16px rgba(62, 107, 247, 0.12)',
        'lab-lg': '0 8px 24px rgba(62, 107, 247, 0.16)',
      },
      minWidth: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
      },
    },
  },
  plugins: [],
};
