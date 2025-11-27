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
            <div>
                <label class="block text-sm font-medium text-[#0B2241] mb-2">Usuario:</label>
                <InputGenerico
                type="text"
                placeholder="Ingresa tu usuario"
                v-model="usuario"
                class="w-full"
                />
            </div>
            
            <div class="relative">
                <label class="block text-sm font-medium text-[#0B2241] mb-2">Contraseña:</label>
                <InputGenerico
                :type="mostrarContrasena ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                v-model="contrasena"
                class="w-full pr-10"
                />
                <!-- Botón para mostrar/ocultar contraseña -->
                <button
                type="button"
                @click="mostrarContrasena = !mostrarContrasena"
                class="absolute right-3 bottom-3 text-gray-500 hover:text-[#174785] transition-colors duration-200"
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
                class="w-full bg-[#174785] hover:bg-[#0B2241] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#174785] focus:ring-opacity-50"
            >
                Aceptar
            </button>
            </form>
        </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: false
})

// Importar el componente InputGenerico
const InputGenerico = defineAsyncComponent(() => import('~/components/InputGenerico.vue'))

// Datos reactivos para el formulario
const usuario = ref('')
const contrasena = ref('')

// Estado para mostrar/ocultar contraseña
const mostrarContrasena = ref(false)

// 1. Si la imagen está en la carpeta 'public':
const fondoUrl = '/login.jpg'

// Función para manejar el envío del formulario
const handleSubmit = () => {
  // Aquí iría la lógica para autenticar al usuario
    console.log('Usuario:', usuario.value)
    console.log('Contraseña:', contrasena.value)
    
    // Por ahora, solo mostramos un mensaje
    alert(`Iniciando sesión para: ${usuario.value}`)
}
</script>

<style scoped>
/* Estilos específicos para esta página si son necesarios */
</style>