<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-4xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                {{ esEdicion ? 'Editar Usuario' : 'Agregar Usuario' }}
            </h1>
            
            <form @submit.prevent="esEdicion ? actualizarUsuario() : agregarUsuario()" class="flex flex-col gap-6 w-full">
                <div class="flex flex-col gap-6 w-full">
                    <div class="flex flex-col gap-2 w-full">
                        <label class="font-petrona text-white text-base font-semibold">Nombre de usuario:</label>
                        <InputGenerico
                            v-model="formData.username"
                            placeholder="Ingrese el nombre de usuario"
                        />
                    </div>

                    <div class="flex flex-col gap-2 w-full">
                        <label class="font-petrona text-white text-base font-semibold">Contraseña:</label>
                        <div class="relative">
                            <InputGenerico
                                v-model="formData.password"
                                :type="mostrarContrasena ? 'text' : 'password'"
                                placeholder="Ingrese la contraseña"
                            />
                            <button
                                type="button"
                                @click="mostrarContrasena = !mostrarContrasena"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg v-if="!mostrarContrasena" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            </button>
                        </div>
                        <p v-if="esEdicion" class="text-sm text-gray-300 mt-1">
                            Deje vacío si no desea cambiar la contraseña
                        </p>
                    </div>
                </div>

                <div class="flex gap-4 justify-center mt-6 w-full">
                    <NuxtLink to="/users/gestionUsuarios" class="flex-1" @click="limpiarStorage">
                        <ButtonGenerico
                            texto="Cancelar"
                        />
                    </NuxtLink>
                    <button 
                        type="submit"
                        class="flex-1 px-6 py-3 bg-[#174785] text-white rounded-lg font-petrona font-semibold text-base cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {{ esEdicion ? 'Actualizar' : 'Agregar' }}
                    </button>
                </div>
            </form>
        </div>

        <!-- Componente de Notificación -->
        <NotificacionEsquina
            :mostrar="mostrarNotificacion"
            :tipo="tipoNotificacion"
            :titulo="tituloNotificacion"
            :mensaje="mensajeNotificacion"
            @cerrar="mostrarNotificacion = false"
        />
    </div>
</template>

<script setup>
// Importar componentes
import InputGenerico from '~/components/InputGenerico.vue'
import ButtonGenerico from '~/components/ButtonGenerico.vue'
import NotificacionEsquina from '~/components/NotificacionEsquina.vue'

// Obtener parámetros de la URL
const route = useRoute()
const esEdicion = computed(() => !!route.query.edit)
const usuarioId = computed(() => route.query.edit)

// Estado para mostrar/ocultar contraseña
const mostrarContrasena = ref(false)

// Reactive data
const formData = reactive({
    username: '',
    password: ''
})

// Estado para la notificación
const mostrarNotificacion = ref(false)
const tipoNotificacion = ref('exito')
const tituloNotificacion = ref('')
const mensajeNotificacion = ref('')

// Claves para localStorage
const STORAGE_KEYS = {
    FORM_DATA: 'usuario_form_data',
    IS_EDITING: 'usuario_is_editing',
    USUARIO_ID: 'usuario_id'
}

// Método para mostrar notificaciones
const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Guardar datos en localStorage
const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        // No guardar la contraseña en localStorage por seguridad
        const dataToStore = {
            username: formData.username
        }
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(dataToStore))
        localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
        if (usuarioId.value) {
            localStorage.setItem(STORAGE_KEYS.USUARIO_ID, usuarioId.value)
        }
    }
}

// Cargar datos desde localStorage
const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedUsuarioId = localStorage.getItem(STORAGE_KEYS.USUARIO_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            formData.username = parsedData.username || parsedData.usuario || ''
            // La contraseña no se carga desde storage por seguridad
        }
        
        // Verificar si estamos en el mismo contexto de edición
        if (savedIsEditing && savedUsuarioId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedUsuarioId === usuarioId.value) {
                console.log('✅ Cargando datos guardados del formulario')
            }
        }
    }
}

// Limpiar localStorage
const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.USUARIO_ID)
    }
}

// Cargar datos del usuario si estamos en modo edición
onMounted(async () => {
    if (esEdicion.value && usuarioId.value) {
        // En modo edición, cargar datos del usuario desde el backend
        await cargarUsuario()
    } else {
        // Si no es edición, cargar datos guardados del formulario
        cargarDesdeStorage()
    }
})

// Watch para guardar automáticamente cuando cambien los datos del formulario
watch(() => formData.username, () => {
    guardarEnStorage()
})

// Watch para guardar cuando cambie el modo edición
watch(esEdicion, () => {
    guardarEnStorage()
})

// Watch para guardar cuando cambie el ID del usuario
watch(usuarioId, () => {
    guardarEnStorage()
})

// Función para cargar datos del usuario
const cargarUsuario = async () => {
    try {
        // Primero verificar si hay datos en cache para mostrar rápidamente
        const cachedData = localStorage.getItem(`usuario_cache_${usuarioId.value}`)
        if (cachedData) {
            try {
                const usuarioCache = JSON.parse(cachedData)
                // Cargar el nombre de usuario desde cache primero para mostrar inmediatamente
                formData.username = usuarioCache.usuario || usuarioCache.username || usuarioCache.nombreUsuario || ''
                // La contraseña siempre se deja vacía en modo edición
                formData.password = ''
                console.log('✅ Usuario cargado desde cache:', formData.username)
            } catch (e) {
                console.warn('Error al parsear cache:', e)
            }
        }

        // Siempre hacer la petición para tener datos actualizados
        const response = await $fetch(`http://localhost:4000/user/${usuarioId.value}`)
        
        console.log('📨 Respuesta completa del servidor:', response)
        
        // Manejar diferentes estructuras de respuesta
        let usuario = null
        if (response && response['Usuario encontrado']) {
            usuario = response['Usuario encontrado']
            console.log('✅ Usuario encontrado en respuesta:', usuario)
        } else if (response && response['Usuario solicitado']) {
            usuario = response['Usuario solicitado']
        } else if (response && response['Usuario']) {
            usuario = response['Usuario']
        } else if (response && (response.usuario || response.username || response.nombreUsuario)) {
            usuario = response
        }
        
        if (usuario) {
            // Actualizar el formulario con los datos del usuario
            // Priorizar el campo 'usuario' que es el que usa el backend
            formData.username = usuario.usuario || usuario.username || usuario.nombreUsuario || ''
            // La contraseña siempre se deja vacía en modo edición (solo se actualiza si se ingresa una nueva)
            formData.password = ''
            
            // Guardar en cache para futuras cargas rápidas
            localStorage.setItem(`usuario_cache_${usuarioId.value}`, JSON.stringify(usuario))
            
            console.log('✅ Usuario cargado correctamente desde API:', formData.username)
            console.log('📋 Datos del usuario:', { usuario: formData.username, password: '(oculto)' })
        } else {
            console.warn('⚠️ No se encontraron datos del usuario en la respuesta:', response)
        }
    } catch (error) {
        console.error('❌ Error al cargar usuario:', error)
        console.error('❌ Detalles:', {
            message: error?.message,
            status: error?.statusCode || error?.status,
            data: error?.data
        })
        mostrarToast('error', 'Error', 'No se pudo cargar la información del usuario')
        
        // Si hay error pero tenemos cache, mantener los datos del cache
        if (!formData.username) {
            const cachedData = localStorage.getItem(`usuario_cache_${usuarioId.value}`)
            if (cachedData) {
                try {
                    const usuarioCache = JSON.parse(cachedData)
                    formData.username = usuarioCache.usuario || usuarioCache.username || usuarioCache.nombreUsuario || ''
                    console.log('⚠️ Usando datos de cache debido al error:', formData.username)
                } catch (e) {
                    console.error('Error al usar cache:', e)
                }
            }
        }
    }
}

// Método para agregar usuario
const agregarUsuario = async () => {
    try {
        // Validar que todos los campos requeridos estén llenos
        if (!formData.username || !formData.password) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Preparar datos - usar los nombres que espera el backend
        const bodyData = {
            usuario: formData.username.trim(),
            contrasena: formData.password
        }

        console.log('📤 Enviando datos al servidor:', { usuario: bodyData.usuario, contrasena: '***' })
        console.log('📤 URL:', 'http://localhost:4000/user')
        console.log('📤 Body completo:', JSON.stringify(bodyData, null, 2))

        // Enviar datos al servidor usando $fetch
        const response = await $fetch('http://localhost:4000/user', {
            method: 'POST',
            body: bodyData,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('✅ Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Usuario agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
        
        // Navegar de vuelta a la gestión de usuarios después de agregar
        setTimeout(() => {
            navigateTo('/users/gestionUsuarios')
        }, 1500)
        
    } catch (error) {
        console.error('❌ Error completo al agregar usuario:', error)
        console.error('❌ Detalles del error:', {
            message: error?.message,
            status: error?.statusCode || error?.status,
            data: error?.data,
            stack: error?.stack
        })
        
        const mensajeError = error?.data?.message || error?.message || 'Error al agregar usuario. Por favor, intente nuevamente.'
        mostrarToast('error', 'Error', mensajeError)
    }
}

// Método para actualizar usuario
const actualizarUsuario = async () => {
    try {
        // Validar que el nombre de usuario esté lleno
        if (!formData.username) {
            mostrarToast('advertencia', 'Campo requerido', 'El nombre de usuario es requerido')
            return
        }

        // Preparar datos - usar los nombres que espera el backend
        const bodyData = {
            usuario: formData.username.trim()
        }

        // Solo incluir contrasena si se proporcionó una nueva
        if (formData.password && formData.password.trim() !== '') {
            bodyData.contrasena = formData.password
        }

        console.log('📤 Actualizando usuario:', { usuario: bodyData.usuario, contrasena: bodyData.contrasena ? '***' : '(sin cambiar)' })
        console.log('📤 URL:', `http://localhost:4000/user/${usuarioId.value}`)
        console.log('📤 Body completo:', JSON.stringify(bodyData, null, 2))

        // Actualizar datos en el servidor usando $fetch
        const response = await $fetch(`http://localhost:4000/user/${usuarioId.value}`, {
            method: 'PUT',
            body: bodyData,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('✅ Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Usuario actualizado correctamente')
        
        // Limpiar cache y storage
        localStorage.removeItem(`usuario_cache_${usuarioId.value}`)
        limpiarStorage()
        
        // Navegar de vuelta a la gestión de usuarios después de actualizar
        setTimeout(() => {
            navigateTo('/users/gestionUsuarios')
        }, 1500)
        
    } catch (error) {
        console.error('❌ Error completo al actualizar usuario:', error)
        console.error('❌ Detalles del error:', {
            message: error?.message,
            status: error?.statusCode || error?.status,
            data: error?.data,
            stack: error?.stack
        })
        
        const mensajeError = error?.data?.message || error?.message || 'Error al actualizar usuario. Por favor, intente nuevamente.'
        mostrarToast('error', 'Error', mensajeError)
    }
}

const limpiarFormulario = () => {
    formData.username = ''
    formData.password = ''
}
</script>

