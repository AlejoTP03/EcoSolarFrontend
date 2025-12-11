<template>
    <div class="min-h-screen flex">
        <!-- Sección de la imagen (mitad izquierda) -->
        <div class="hidden lg:flex lg:w-1/2 bg-cover bg-center" 
            :style="{ backgroundImage: `url(${fondoUrl})` }">
        </div>
        
        <!-- Sección del formulario (mitad derecha) -->
        <div class="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#174785] to-[#0B2241] p-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h1 class="text-3xl font-bold text-center mb-8 text-[#0B2241]">Iniciar Sesión</h1>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Mensaje de error -->
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ error }}
            </div>
            
            <!-- Mensaje de éxito -->
            <div v-if="mensajeExito" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {{ mensajeExito }}
            </div>
            
            <div>
                <label class="block text-sm font-medium text-[#0B2241] mb-2">Usuario:</label>
                <InputGenerico
                type="text"
                placeholder="Ingresa tu usuario"
                v-model="credentials.usuario"
                class="w-full"
                :disabled="isLoading"
                />
            </div>
            
            <div class="relative">
                <label class="block text-sm font-medium text-[#0B2241] mb-2">Contraseña:</label>
                <InputGenerico
                :type="mostrarContrasena ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                v-model="credentials.contrasena"
                class="w-full pr-10"
                :disabled="isLoading"
                />
                <!-- Botón para mostrar/ocultar contraseña -->
                <button
                type="button"
                @click="mostrarContrasena = !mostrarContrasena"
                class="absolute right-3 bottom-3 text-gray-500 hover:text-[#174785] transition-colors duration-200"
                :disabled="isLoading"
                >
                <svg 
                    v-if="mostrarContrasena" 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <svg 
                    v-else 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                >
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
                </button>
            </div>
            
            <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-[#174785] hover:bg-[#0B2241] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#174785] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span v-if="isLoading">Iniciando sesión...</span>
                <span v-else>Aceptar</span>
            </button>
            </form>
        </div>
        </div>
    </div>
</template>

<script setup>
    import { defineAsyncComponent, ref } from '#imports'

    definePageMeta({
    layout: false,
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/'
    }
    })

    // Importar el componente InputGenerico
    const InputGenerico = defineAsyncComponent(() => import('~/components/InputGenerico.vue'))

    // Usar el composable para gestionar el token
    const { setToken, hasToken } = useAuthToken()

    // Datos reactivos para el formulario
    const credentials = ref({
    usuario: '',
    contrasena: ''
    })

    // Estado para mostrar/ocultar contraseña
    const mostrarContrasena = ref(false)

    // Estados de carga y errores
    const isLoading = ref(false)
    const error = ref('')
    const mensajeExito = ref('')

    // URL de la imagen de fondo
    const fondoUrl = '/login.jpg'

    // Función para manejar el envío del formulario
    const handleSubmit = async () => {
    // Resetear estados
    error.value = ''
    mensajeExito.value = ''
    isLoading.value = true

    try {
        // Validar que los campos estén llenos
        if (!credentials.value.usuario || !credentials.value.contrasena) {
        error.value = 'Por favor, complete todos los campos'
        isLoading.value = false
        return
        }

        console.log('📤 Iniciando sesión...', { 
        usuario: credentials.value.usuario 
        })

        // Preparar datos para enviar al servidor
        const bodyData = {
            usuario: credentials.value.usuario.trim(),
            contrasena: credentials.value.contrasena
        }

        // Hacer petición POST al endpoint de login
        const response = await $fetch('http://localhost:4000/user/login', {
            method: 'POST',
            body: bodyData,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('✅ Respuesta del servidor:', response)

        // Extraer el token de la respuesta
        // El token puede venir en diferentes formatos según el backend
        let token = null
        if (response.token) {
            token = response.token
        } else if (response.accessToken) {
            token = response.accessToken
        } else if (response.data?.token) {
            token = response.data.token
        } else if (typeof response === 'string') {
            // Si la respuesta es directamente el token
            token = response
        }

        if (!token) {
            throw new Error('No se recibió un token del servidor')
        }

        // Guardar el token en localStorage
        setToken(token)
        console.log('✅ Token guardado correctamente')

        mensajeExito.value = 'Inicio de sesión exitoso'
        
        // Redirigir a la página index después de un breve delay
        setTimeout(async () => {
            await navigateTo('/')
        }, 1000)

    } catch (err) {
        console.error('❌ Error al iniciar sesión:', err)
        
        // Manejar diferentes tipos de errores
        if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Usuario no Autorizado'
        } else if (err?.message?.includes('Network') || err?.message?.includes('fetch')) {
        error.value = 'Error de conexión. Verifica tu red.'
        } else {
        // Siempre mostrar "Usuario no Autorizado" para errores de autenticación
        error.value = 'Usuario no Autorizado'
        }
    } finally {
        isLoading.value = false
    }
    }

    // Verificar si ya hay una sesión activa al cargar la página
    onMounted(() => {
    if (hasToken()) {
        console.log('✅ Token encontrado, redirigiendo a index...')
        navigateTo('/')
    }
    })
</script>