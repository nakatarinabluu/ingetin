/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        // WhatsApp official palette — directly usable as Tailwind classes
        wa: {
          green: '#00a884',
          'green-dark': '#008069',
          'green-light': '#d9fdd3',
          teal: '#128C7E',
          bg: '#f0f2f5',
          surface: '#ffffff',
          dark: '#111b21',
          icon: '#54656f',
          border: '#e9edef',
          panel: '#202c33',
          muted: '#667781',
          incoming: '#ffffff',
          outgoing: '#d9fdd3',
        }
      },
      borderRadius: {
        'full': '9999px',
        '3xl': '1.5rem',
        '2xl': '1rem',
        'xl': '0.75rem',
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.25rem',
      },
      boxShadow: {
        'wa': '0 1px 3px rgba(17, 27, 33, 0.06), 0 1px 2px rgba(17, 27, 33, 0.04)',
        'wa-md': '0 4px 16px rgba(17, 27, 33, 0.08), 0 2px 6px rgba(17, 27, 33, 0.04)',
        'wa-lg': '0 8px 32px rgba(17, 27, 33, 0.10), 0 4px 12px rgba(17, 27, 33, 0.06)',
        // Keep compat
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'modern': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}