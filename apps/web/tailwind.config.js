/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-primary)',
          active: 'var(--color-primary-active)',
          disabled: 'var(--color-primary-disabled)',
          soft: 'var(--color-primary-soft)',
        },
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        'muted-soft': 'var(--color-muted-soft)',
        line: 'var(--color-hairline)',
        'line-soft': 'var(--color-hairline-soft)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface-soft)',
        'surface-strong': 'var(--color-surface-strong)',
        'surface-dark': 'var(--color-surface-dark)',
        success: 'var(--color-success)',
        'success-strong': 'var(--color-success-strong)',
        'success-soft': 'var(--color-success-soft)',
        danger: 'var(--color-danger)',
        'danger-soft': 'var(--color-danger-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        'warning-strong': 'var(--color-warning-strong)',
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['Inter', 'Noto Sans TC', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      borderRadius: {
        control: '12px',
        card: '24px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(10, 11, 13, 0.04)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}

