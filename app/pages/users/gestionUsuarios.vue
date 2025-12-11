<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Usuarios</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/users/formularioUsuario">
                        <BottonAgregar 
                            :button-text="'Agregar Usuario'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending && usuarios.length === 0" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded m-4">
            <p>Error al cargar los usuarios: {{ error.message }}</p>
            <button 
                @click="fetchUsuarios" 
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        </div>

        <!-- Mostrar cuando no hay datos -->
        <div v-else-if="usuarios.length === 0" class="text-center py-8">
            <p class="text-gray-600 text-lg">No hay usuarios para mostrar</p>
            <button 
                @click="fetchUsuarios" 
                class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                Cargar Usuarios
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="usuariosFormateados"
                @edit="editarUsuario"
                @delete="iniciarEliminacion"
            />
        </div>

        <!-- Modal de confirmación -->
        <ModalConfirmacion 
            :show="showModalConfirmacion"
            :titulo="'Eliminar Usuario'"
            :mensaje="`¿Estás seguro de que quieres eliminar al usuario ${usuarioAEliminar?.NombreDeUsuario || ''}? Esta acción no se puede deshacer.`"
            @confirm="confirmarEliminacion"
            @cancel="cancelarEliminacion"
        />

        <!-- Notificación de éxito -->
        <NotificacionEsquina 
            :mostrar="mostrarNotificacion"
            tipo="exito"
            titulo="¡Éxito!"
            :mensaje="mensajeNotificacion"
            :duracion="3000"
            @cerrar="mostrarNotificacion = false"
        />
    </div>
</template>

<script setup>
// Importar componentes
import TablaGenerica from '~/components/TablaGenerica.vue'
import BottonAgregar from '~/components/BottonAgregar.vue'
import ModalConfirmacion from '~/components/ModalConfirmacion.vue'
import NotificacionEsquina from '~/components/NotificacionEsquina.vue'

// Estados reactivos
const usuarios = ref([])
const pending = ref(true) // Iniciar como true para mostrar loading
const error = ref(null)
const showModalConfirmacion = ref(false)
const usuarioAEliminar = ref(null)
const mostrarNotificacion = ref(false)
const mensajeNotificacion = ref('')

// Clave para localStorage
const STORAGE_KEY = 'users_table_cache'

// Columnas de la tabla
const columnas = ['Nombre de usuario', 'Contraseña']

// Función para mostrar notificación
const mostrarNotificacionExito = (mensaje) => {
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Datos formateados para la tabla
const usuariosFormateados = computed(() => {
    console.log('🔄 Formateando usuarios:', usuarios.value.length)
    return usuarios.value.map(usuario => ({
        'Nombre de usuario': usuario.usuario || usuario.username || usuario.nombreUsuario || 'N/A',
        'Contraseña': usuario.contrasena || usuario.password ? '••••••••' : 'N/A', // Ocultar contraseña
        idUser: usuario.idUser || usuario.id || usuario._id // Mantener ID para operaciones pero no mostrarlo
    }))
})

// Función para guardar en localStorage
const saveToLocalStorage = (data) => {
    if (process.client) {
        try {
            console.log('💾 Guardando en localStorage:', data.length, 'usuarios')
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            
            // Verificar que se guardó
            const verify = localStorage.getItem(STORAGE_KEY)
            const verifiedData = verify ? JSON.parse(verify) : []
            console.log('✅ Verificación - Datos guardados:', verifiedData.length, 'usuarios')
        } catch (e) {
            console.error('❌ Error guardando en localStorage:', e)
        }
    }
}

// Función para cargar desde localStorage
const loadFromLocalStorage = () => {
    if (process.client) {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            console.log('📥 Intentando cargar desde localStorage...')
            
            if (stored) {
                const parsedData = JSON.parse(stored)
                console.log('✅ Datos cargados desde cache:', parsedData.length, 'usuarios')
                return parsedData
            } else {
                console.log('📭 No hay datos en localStorage')
            }
        } catch (e) {
            console.error('❌ Error leyendo localStorage:', e)
        }
    }
    return null
}

// Usar el composable para obtener el token
const { getAuthHeaders, hasToken } = useAuthToken()

// Función para obtener usuarios desde el backend
const fetchUsuarios = async () => {
    console.log('🚀 Iniciando fetchUsuarios...')
    pending.value = true
    error.value = null
    
    try {
        // Verificar si hay token antes de hacer la petición
        if (!hasToken()) {
            console.warn('⚠️ No hay token de autenticación')
            error.value = new Error('No autenticado. Por favor, inicia sesión.')
            // Redirigir al login si no hay token
            await navigateTo('/login')
            return
        }

        console.log('🌐 Haciendo petición a la API con token...')
        
        // Usar $fetch con los headers de autenticación
        const data = await $fetch('http://localhost:4000/user', {
            method: 'GET',
            headers: getAuthHeaders()
        })
        
        console.log('📨 Respuesta completa de la API:', data)
        
        if (data && data['Todos los usuarios']) {
            usuarios.value = data['Todos los usuarios']
            console.log('✅ Usuarios asignados desde "Todos los usuarios":', usuarios.value.length)
        } else if (data && data['Usuarios']) {
            usuarios.value = data['Usuarios']
            console.log('✅ Usuarios asignados desde "Usuarios":', usuarios.value.length)
        } else if (data && Array.isArray(data)) {
            usuarios.value = data
            console.log('✅ Usuarios asignados (array directo):', usuarios.value.length)
        } else {
            usuarios.value = []
            console.warn('⚠️  No se encontraron usuarios en la respuesta o formato inesperado:', data)
        }

        // Guardar en cache solo si tenemos datos
        if (usuarios.value.length > 0) {
            saveToLocalStorage(usuarios.value)
        }
        
    } catch (err) {
        error.value = err
        console.error('❌ Error fetching users:', err)
        
        // Si es error 401, el token puede ser inválido
        if (err?.status === 401 || err?.statusCode === 401) {
            console.warn('⚠️ Token inválido o expirado, redirigiendo al login...')
            await navigateTo('/login')
            return
        }
        
        // Intentar cargar del cache como respaldo
        console.log('🔄 Intentando cargar desde cache por error...')
        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            usuarios.value = cachedData
            error.value = null // Limpiar error porque tenemos cache
            console.log('✅ Recuperados desde cache después de error:', usuarios.value.length)
        } else {
            console.log('📭 No hay cache disponible')
        }
    } finally {
        pending.value = false
        console.log('🏁 Fetch completado. Total usuarios:', usuarios.value.length)
    }
}

// Métodos para manejar eventos
const editarUsuario = (usuario) => {
    console.log('✏️ Editar usuario:', usuario)
    navigateTo(`/users/formularioUsuario?edit=${usuario.idUser || usuario.id || usuario._id}`)
}

const iniciarEliminacion = (usuario) => {
    usuarioAEliminar.value = usuario
    showModalConfirmacion.value = true
}

const confirmarEliminacion = async () => {
    if (usuarioAEliminar.value) {
        try {
            const idAEliminar = usuarioAEliminar.value.idUser || usuarioAEliminar.value.id || usuarioAEliminar.value._id
            
            if (!idAEliminar) {
                throw new Error('ID del usuario no encontrado')
            }
            
            await eliminarUsuarioBackend(idAEliminar)
            
            const index = usuarios.value.findIndex(usuario => {
                const userId = usuario.idUser || usuario.id || usuario._id
                return userId === idAEliminar
            })
            
            if (index !== -1) {
                const nombreUsuario = usuarioAEliminar.value['Nombre de usuario'] || 'Usuario'
                usuarios.value.splice(index, 1)
                
                // Mostrar notificación de éxito
                mostrarNotificacionExito(`Usuario "${nombreUsuario}" eliminado correctamente`)
            }

            // Actualizar cache después de eliminar
            saveToLocalStorage(usuarios.value)
            
            showModalConfirmacion.value = false
            usuarioAEliminar.value = null
            
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar el usuario. Por favor, intenta nuevamente.')
        }
    }
}

const cancelarEliminacion = () => {
    showModalConfirmacion.value = false
    usuarioAEliminar.value = null
}

// Función para eliminar en el backend
const eliminarUsuarioBackend = async (idUser) => {
    try {
        // Verificar token antes de eliminar
        if (!hasToken()) {
            await navigateTo('/login')
            throw new Error('No autenticado')
        }

        await $fetch(`http://localhost:4000/user/${idUser}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        console.log('✅ Usuario eliminado correctamente del backend')
        
    } catch (err) {
        console.error('❌ Error eliminando usuario:', err)
        
        // Si es error 401, redirigir al login
        if (err?.status === 401 || err?.statusCode === 401) {
            await navigateTo('/login')
        }
        
        throw new Error('No se pudo eliminar el usuario')
    }
}

// Cargar usuarios al montar el componente
onMounted(async () => {
    // Verificar si hay token antes de cargar datos
    if (!hasToken()) {
        console.warn('⚠️ No hay token, redirigiendo al login...')
        await navigateTo('/login')
        return
    }

    console.log('🎬 Componente montado - Iniciando carga...')
    
    // Primero cargar desde cache inmediatamente
    const cachedData = loadFromLocalStorage()
    if (cachedData && cachedData.length > 0) {
        usuarios.value = cachedData
        pending.value = false // Ya tenemos datos, no mostrar loading
        console.log('✅ Cache cargado al montar:', usuarios.value.length, 'usuarios')
    } else {
        console.log('📭 No hay datos en cache al montar')
    }
    
    // Siempre intentar cargar datos frescos
    fetchUsuarios()
})

// Watcher para debug
watch(usuarios, (newVal) => {
    console.log('👀 Usuarios actualizados:', newVal.length)
}, { deep: false })
</script>

