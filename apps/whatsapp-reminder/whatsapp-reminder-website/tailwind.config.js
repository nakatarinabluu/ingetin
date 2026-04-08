/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crystal-indigo': '#5D5FEF', // The primary brand color
        'crystal-bg': '#F9FAFB',     // Pristine Light Grey
        'crystal-glass': 'rgba(255, 255, 255, 0.7)', // Frosted glass foundation
        'crystal-accent': '#FF9F6A',
        'crystal-success': '#10B981',
        'crystal-text': '#1F2937',   // Dark Slate
        'crystal-border': '#E5E7EB', // Neutral border
        'crystal-indigo-border': '#5D5FEF', // Solid Indigo border
        
        // WhatsApp Official Theme
        'wa-green': '#25D366',
        'wa-green-vibrant': '#00A884', // Newer WhatsApp Green
        'wa-teal': '#075E54',
        'wa-teal-light': '#128C7E',
        'wa-bg': '#F0F2F5',
        'wa-chat-bg': '#EFE7DE',
        'wa-bubble-out': '#D9FDD3',
        'wa-bubble-in': '#FFFFFF',
        'wa-text-primary': '#111B21',
        'wa-text-secondary': '#667781',
        'wa-border': '#D1D7DB',
        'wa-panel': '#F0F2F5',
        'wa-sidebar': '#FFFFFF',
        'wa-active': '#F5F6F6',
        
        // Indigo Sky Theme
        'sky-bg': '#F0F4F8',
        'sky-indigo': '#5D5FEF',
        'sky-accent': '#FF9F6A',
        'sky-text': '#1E293B',
      },
      borderRadius: {
        'crystal': '1.5rem',
        'wa': '0.5rem', // WhatsApp Desktop rounded corners are tighter
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica Neue', 'Helvetica', 'Lucida Grande', 'Arial', 'Ubuntu', 'Cantarell', 'Fira Sans', 'sans-serif'],
      },
      backgroundImage: {
        'crystal-mesh': 'radial-gradient(at 0% 0%, rgba(93, 95, 239, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(93, 95, 239, 0.05) 0px, transparent 50%)',
      },
      boxShadow: {
        'crystal-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
