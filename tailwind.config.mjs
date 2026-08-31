/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Merriweather', 'Georgia', 'Cambria', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        paper: {
          50: '#fdfbf7',
          100: '#f9f6f0',
          200: '#f1ede4',
          300: '#e5dec9',
          800: '#1c1f26',
          900: '#12151c',
          950: '#0b0d13',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '68ch',
            color: theme('colors.zinc.800'),
            lineHeight: '1.8',
            fontFamily: theme('fontFamily.serif').join(', '),
            fontSize: '1.125rem',
            p: {
              marginBottom: '1.5em',
            },
            h1: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '800',
              letterSpacing: '-0.025em',
              color: theme('colors.zinc.950'),
            },
            h2: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginTop: '2em',
              marginBottom: '0.8em',
              color: theme('colors.zinc.900'),
            },
            h3: {
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
              marginTop: '1.6em',
              marginBottom: '0.6em',
              color: theme('colors.zinc.900'),
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeftColor: theme('colors.brand.500'),
              borderLeftWidth: '3px',
              paddingLeft: '1.25rem',
              color: theme('colors.zinc.700'),
            },
            code: {
              fontFamily: theme('fontFamily.mono').join(', '),
              backgroundColor: theme('colors.zinc.100'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            a: {
              color: theme('colors.brand.600'),
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: theme('colors.brand.700'),
              },
            },
            img: {
              borderRadius: '0.5rem',
              margin: '2em auto',
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.zinc.200'),
            h1: { color: theme('colors.zinc.50') },
            h2: { color: theme('colors.zinc.100') },
            h3: { color: theme('colors.zinc.200') },
            blockquote: {
              borderLeftColor: theme('colors.brand.400'),
              color: theme('colors.zinc.300'),
            },
            code: {
              backgroundColor: theme('colors.zinc.800'),
              color: theme('colors.zinc.200'),
            },
            a: {
              color: theme('colors.brand.400'),
              '&:hover': {
                color: theme('colors.brand.300'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    import('@tailwindcss/typography'),
    import('@tailwindcss/forms'),
  ],
};
