import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  /**
   * El puerto NO puede moverse solo.
   *
   * -- EL FALLO QUE ESTO ARREGLA ---------------------------------------
   * Las Edge Functions traen una lista blanca de CORS y el unico origen
   * local que aceptan es `http://localhost:5173`, puerto escrito a mano
   * (supabase/functions/humaya-{admin,entrada,concierge}/index.ts).
   *
   * Vite, por omision, si 5173 esta ocupado se pasa a 5174 sin avisar.
   * Y entonces la app ABRE —el HTML, el CSS, las rutas, todo— pero el
   * navegador tira cada respuesta de Supabase, y la pantalla dice "No
   * pudimos cargar esta pantalla", que suena a que la funcion esta caida.
   * Pasa con dos sesiones a la vez: la segunda hereda el 5174.
   *
   * El 24 de noviembre de 2026 eso me costo dar por imposible probar la
   * app del huesped en local y escribirselo a Tony como un hecho. Era
   * mentira: en 5173 funciona. Lo comprobado ese dia, desde la pagina:
   *   /functions/v1/humaya-admin?que=opciones&hotel=demo -> 200
   *
   * Con `strictPort` el servidor se niega a arrancar en otro puerto y lo
   * dice. Un fallo que se ve vale mas que uno que se disfraza de caida
   * ajena.
   */
  /**
   * `host` atado a IPv4 a proposito: Vite por omision se ata a `::1`, y
   * entonces `http://127.0.0.1:5173` NO contesta. Y ese origen hace falta,
   * porque la lista blanca acepta los dos y en `humaya_dominios` cada uno
   * sirve para una cosa distinta:
   *
   *   localhost  -> HOTEL DEMO, lado «ambos». Recepcion y la demo.
   *   127.0.0.1  -> dominio COMPARTIDO del huesped, como guestexp. Acá el
   *                 hotel lo dice la ruta: /bikeandbed/app, /demo/app. Es la
   *                 unica forma de abrir un hotel DE VERDAD en local.
   *
   * `localhost` sigue funcionando: Windows lo resuelve a ::1 y a 127.0.0.1,
   * y el navegador prueba las dos.
   */
  server: { strictPort: true, host: '127.0.0.1' },
  preview: { strictPort: true, host: '127.0.0.1' },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        name: 'Humaya · Become More Human',
        short_name: 'Humaya',
        description: 'Tu estadía y el Método Humaya, siempre a mano.',
        lang: 'es',
        start_url: '/app',
        scope: '/app',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,woff,woff2,svg,png,jpg,jpeg,ico}'],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
