import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Skinworld V1. Los valores viven como variables en src/styles/globals.css
        // (canales RGB) para que haya una sola fuente y funcionen las opacidades
        // de Tailwind, p. ej. bg-sw-ink/60.
        sw: {
          pink: 'rgb(var(--sw-pink) / <alpha-value>)',
          'pink-soft': 'rgb(var(--sw-pink-soft) / <alpha-value>)',
          'pink-pale': 'rgb(var(--sw-pink-pale) / <alpha-value>)',
          'pink-deep': 'rgb(var(--sw-pink-deep) / <alpha-value>)',
          ink: 'rgb(var(--sw-ink) / <alpha-value>)',
          charcoal: 'rgb(var(--sw-charcoal) / <alpha-value>)',
          'warm-white': 'rgb(var(--sw-warm-white) / <alpha-value>)',
          white: 'rgb(var(--sw-white) / <alpha-value>)',
          surface: 'rgb(var(--sw-surface) / <alpha-value>)',
          border: 'rgb(var(--sw-border) / <alpha-value>)',
          text: 'rgb(var(--sw-text) / <alpha-value>)',
          muted: 'rgb(var(--sw-muted) / <alpha-value>)',
          cream: 'rgb(var(--sw-cream) / <alpha-value>)',
          'cream-muted': 'rgb(var(--sw-cream-muted) / <alpha-value>)',
        },
        // Paletas anteriores. Se conservan mientras la tienda migra a sw-*,
        // porque el panel de administración y el formulario de dirección las usan.
        // Paleta Rosa Skin World Original
        'primary': {
          50: '#fdf8f9',
          100: '#faf1f3',
          200: '#f5dfe8',
          300: '#e8c4cc',
          400: '#e0adb8',
          500: '#d4a5af',  // Color primario - Rosa Skin World
          600: '#c8929f',
          700: '#bc7f8f',
          800: '#a86a7a',
          900: '#945562',
        },
        'accent': {
          50: '#fffbfc',
          100: '#fff5f8',
          200: '#ffe8f0',
          300: '#ffd4e5',
          400: '#ffc0d9',
          500: '#E89BA9',  // Accent rosa más fuerte
          600: '#dc87a0',
          700: '#d07397',
          800: '#c4598e',
          900: '#b84585',
        },
        'gold': {
          50: '#fdfbf3',
          100: '#faf3dc',
          200: '#f3e2ac',
          300: '#e9cd76',
          400: '#ddb852',
          500: '#d4af37',  // Accent oro - detalles de lujo
          600: '#b8942a',
          700: '#967622',
          800: '#785e1f',
          900: '#644e1d',
        },
        'ink': {
          DEFAULT: '#1a1a1a',
        },
        'slate': {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      fontFamily: {
        'sans': ['var(--font-inter)', '-apple-system', 'system-ui', 'sans-serif'],
        'display': ['var(--font-playfair)', 'Georgia', 'serif'],
        'accent': ['var(--font-inter)', '-apple-system', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '52px' }],
        // Escala Skinworld V1: de 375 px a 1440 px crece de forma continua.
        'sw-display': ['clamp(3.5rem, 2.55rem + 4.05vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'sw-h1': ['clamp(3rem, 2.47rem + 2.25vw, 4.5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'sw-h2': ['clamp(2.375rem, 2.05rem + 1.4vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'sw-h3': ['clamp(1.75rem, 1.57rem + 0.75vw, 2.25rem)', { lineHeight: '1.18', letterSpacing: '-0.01em' }],
        'sw-lead': ['clamp(1.125rem, 1.06rem + 0.28vw, 1.3125rem)', { lineHeight: '1.55' }],
        'sw-body': ['clamp(1rem, 0.975rem + 0.1vw, 1.0625rem)', { lineHeight: '1.65' }],
        'sw-small': ['0.875rem', { lineHeight: '1.45' }],
        'sw-xs': ['0.8125rem', { lineHeight: '1.4' }],
      },
      maxWidth: {
        sw: '80rem',
        'sw-prose': '38rem',
      },
      borderRadius: {
        'sw-sm': '4px',
        sw: '8px',
        'sw-lg': '16px',
      },
      transitionTimingFunction: {
        sw: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      transitionDuration: {
        'sw-fast': '180ms',
        sw: '280ms',
        'sw-slow': '450ms',
      },
      spacing: {
        // Ritmo vertical entre secciones y margen lateral: menos aire en el
        // celular, mucho espacio negativo en pantallas grandes.
        'sw-section': 'clamp(3.5rem, 2.25rem + 5.5vw, 8rem)',
        'sw-gutter': 'clamp(1rem, 0.55rem + 2vw, 2.5rem)',
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-left': 'max(1rem, env(safe-area-inset-left))',
        'safe-right': 'max(1rem, env(safe-area-inset-right))',
      },
      boxShadow: {
        'soft': '0 2px 24px -8px rgba(26,26,26,0.08)',
        'card': '0 1px 2px rgba(26,26,26,0.04), 0 8px 24px -12px rgba(26,26,26,0.10)',
        'card-hover': '0 4px 8px rgba(26,26,26,0.04), 0 20px 40px -16px rgba(26,26,26,0.18)',
        'gold': '0 8px 30px -8px rgba(212,175,55,0.35)',
        'sw-sm': '0 1px 2px rgb(31 26 28 / 0.06), 0 4px 12px -6px rgb(31 26 28 / 0.08)',
        'sw-md': '0 12px 40px -12px rgb(31 26 28 / 0.22)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        // Entrada única de la portada; se desactiva con prefers-reduced-motion.
        'sw-rise': 'swRise 450ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        swRise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
