import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const darkBackground = { fit: 'contain' as const, background: '#0a0a0a' };

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: darkBackground,
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: darkBackground,
    },
  },
  images: ['public/mark-gold.png'],
});
