/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        body: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: {
          base: '#080810',
          surface: '#0e0e1a',
          elevated: '#14141f',
          overlay: '#1a1a2a',
        },
        accent: {
          primary: '#7c6dff',
          glow: '#a48fff',
          soft: 'rgba(124, 109, 255, 0.15)',
          border: 'rgba(124, 109, 255, 0.3)',
        },
        platform: {
          instagram: '#E1306C',
          tiktok: '#69C9D0',
          youtube: '#FF0000',
          facebook: '#1877F2',
        },
        text: {
          primary: '#f0f0ff',
          secondary: '#8888aa',
          muted: '#4a4a6a',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          subtle: 'rgba(255,255,255,0.04)',
          strong: 'rgba(255,255,255,0.12)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(253,100%,70%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,70%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(270,100%,60%,0.1) 0px, transparent 50%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(124, 109, 255, 0.2)',
        'glow-lg': '0 0 60px rgba(124, 109, 255, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'elevated': '0 8px 48px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
