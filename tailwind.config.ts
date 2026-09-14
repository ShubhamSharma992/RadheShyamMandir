import type { Config } from 'tailwindcss'

/**
 * Palette is drawn from the building materials of a Yamuna-belt village
 * temple: lime whitewash, sindoor, brass, tulsi, and the dark wood of
 * temple doors. Deliberately not a cream-and-terracotta scheme.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        whitewash: '#F2F4EE',
        parchment: '#E8EBE1',
        bark: { DEFAULT: '#1E2A22', soft: '#3A4A40', muted: '#6B7A70' },
        sindoor: { DEFAULT: '#B1332E', deep: '#8C2622', tint: '#F6E4E2' },
        brass: { DEFAULT: '#E0A128', deep: '#B47C14', tint: '#FAF0D9' },
        tulsi: { DEFAULT: '#2F5D4A', tint: '#E2EBE4' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fourth-based scale, fluid between mobile and desktop.
        'step--1': ['clamp(0.82rem, 0.79rem + 0.15vw, 0.9rem)', { lineHeight: '1.5' }],
        'step-0': ['clamp(1rem, 0.96rem + 0.2vw, 1.08rem)', { lineHeight: '1.65' }],
        'step-1': ['clamp(1.25rem, 1.16rem + 0.45vw, 1.5rem)', { lineHeight: '1.4' }],
        'step-2': ['clamp(1.56rem, 1.4rem + 0.8vw, 2rem)', { lineHeight: '1.25' }],
        'step-3': ['clamp(1.95rem, 1.66rem + 1.45vw, 2.66rem)', { lineHeight: '1.15' }],
        'step-4': ['clamp(2.44rem, 1.95rem + 2.45vw, 3.55rem)', { lineHeight: '1.05' }],
        'step-5': ['clamp(3.05rem, 2.24rem + 4vw, 4.74rem)', { lineHeight: '1' }],
      },
      maxWidth: { prose: '66ch', shell: '78rem' },
      borderRadius: { arch: '50% 50% 0 0 / 30% 30% 0 0' },
      boxShadow: {
        lift: '0 1px 2px rgba(30,42,34,0.05), 0 12px 32px -18px rgba(30,42,34,0.35)',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        flame: {
          '0%,100%': { transform: 'scaleY(1) translateY(0)', opacity: '0.9' },
          '50%': { transform: 'scaleY(1.08) translateY(-1px)', opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.22,1,0.36,1) both',
        flame: 'flame 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
