import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        // ===== PRIMARY BRAND COLORS =====
        primary: {
          DEFAULT: '#40521B', // New Main Olive Green
          dark: '#334612',
          light: '#556F1F',
          soft: '#B7C7A0',

          50: '#F5F7F2',
          100: '#E9EDDF',
          200: '#D3DBC1',
          300: '#B7C39A',
          400: '#93A66B',
          500: '#40521B',
          600: '#556F1F',
          700: '#40521B',
          800: '#334612',
          900: '#252F0C',
        },

        // ===== ACCENT COLORS =====
        accent: {
          blue: '#3B82F6',
          teal: '#0F766E',
          orange: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6',
          pink: '#EC4899',
        },

        // ===== BACKGROUND COLORS =====
        background: {
          DEFAULT: '#F5F7F2',
          secondary: '#E9EDDF',
          tertiary: '#FAFBF8',
        },

        // ===== SURFACE COLORS =====
        surface: {
          DEFAULT: '#FFFFFF',
          sidebar: '#FFFFFF',
          navbar: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F0F3E8',
          border: '#E9EDDF',
          strong: '#CDD5BF',
        },

        // ===== TEXT COLORS =====
        text: {
          primary: '#1E293B',
          secondary: '#475569',
          muted: '#64748B',
          light: '#94A3B8',
          white: '#FFFFFF',
        },

        // ===== STATUS COLORS =====
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },

      // ===== FONTS =====
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },

      // ===== SHADOWS =====
      boxShadow: {
        sidebar: '0 4px 30px rgba(0,0,0,0.04)',

        navbar: '0 1px 2px rgba(0,0,0,0.04)',

        card: '0 4px 20px rgba(107,127,58,0.06)',

        hover:
          '0 10px 30px rgba(107,127,58,0.10)',

        soft: '0 2px 10px rgba(0,0,0,0.03)',
      },

      // ===== ANIMATIONS =====
      animation: {
        'fade-in': 'fadeIn 0.4s ease',
        'slide-up': 'slideUp 0.4s ease',
        'slide-left': 'slideLeft 0.3s ease',
        float: 'float 3s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2s infinite',
      },

      // ===== KEYFRAMES =====
      keyframes: {
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },

        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(15px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        slideLeft: {
          from: {
            opacity: '0',
            transform: 'translateX(-15px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },

        float: {
          '0%,100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-6px)',
          },
        },

        pulseSoft: {
          '0%,100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.7',
          },
        },
      },

      // ===== CONTAINER =====
      container: {
        center: true,
        padding: '1rem',
      },

      // ===== BACKDROP BLUR =====
      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
}

export default config