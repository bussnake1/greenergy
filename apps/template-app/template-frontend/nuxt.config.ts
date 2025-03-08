import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';
import { join } from 'path';
import { createGlobPatternsForDependencies } from '@nx/vue/tailwind';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../../',
  srcDir: 'src',
  buildDir: '../../../dist/apps/template-app/template-frontend/.nuxt',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  colorMode: {
    preference: 'light'
  },
  devServer: {
    host: 'localhost',
    port: 4200,
  },

  typescript: {
    typeCheck: true,
    tsConfig: {
      extends: '../tsconfig.app.json', // Nuxt copies this string as-is to the `./.nuxt/tsconfig.json`, therefore it needs to be relative to that directory
    },
  },

  tailwindcss: {
    config: {
      content: [
        join(__dirname, 'index.html'),
        join(__dirname, 'src/**/*!(*.stories|*.spec).{vue,ts,tsx,js,jsx}'),
        ...createGlobPatternsForDependencies(__dirname),
        "../../../libs/shared-client/**/*.{vue,js,ts}",
      ],
    },
  },

  imports: {
    autoImport: true,
  },

  css: ['~/assets/css/styles.css'],

  vite: {
    plugins: [nxViteTsPaths()],
  },

  runtimeConfig: {
    apiBaseUrl: 'http://localhost:3333/api',
    // public: {
    // }
  },

  nitro: {
    output: {
      publicDir: '../../../dist/apps/template-app/template-frontend/.output/public',
      serverDir: '../../../dist/apps/template-app/template-frontend/.output/server',
    }
  },

  compatibilityDate: '2025-02-23',
});
