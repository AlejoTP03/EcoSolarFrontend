import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@sidebase/nuxt-auth'
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  auth: {
    baseURL: 'http://localhost:4000',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { 
          path: '/user/login', 
          method: 'post' 
        },
        signOut: { 
          path: '/user/logout', 
          method: 'post' 
        },
        getSession: { 
          path: '/user/profile', 
          method: 'get' 
        },
      },

      pages: {
        login: "/login",
      },
      
      token: {
        // Ajusta según la estructura de tu respuesta
        signInResponseTokenPointer: '/token', // o '/accessToken' según tu API
      },
      // No necesitas definir sessionDataType aquí si usas useAuth
    }
  }




})

