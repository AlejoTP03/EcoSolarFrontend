<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Clientes</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/clients/formularioCliente">
                        <BottonAgregar 
                            :button-text="'Agregar Cliente'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending && clientes.length === 0" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando clientes...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded m-4">
            <p>Error al cargar los clientes: {{ error.message }}</p>
            <button 
                @click="fetchClientes" 
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        </div>

        <!-- Mostrar cuando no hay datos -->
        <div v-else-if="clientes.length === 0" class="text-center py-8">
            <p class="text-gray-600 text-lg">No hay clientes para mostrar</p>
            <button 
                @click="fetchClientes" 
                class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                Cargar Clientes
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="clientesFormateados"
                @edit="editarCliente"
                @delete="iniciarEliminacion"
            />
        </div>

        <!-- Modal de confirmación -->
        <ModalConfirmacion 
            :show="showModalConfirmacion"
            :titulo="'Eliminar Cliente'"
            :mensaje="`¿Estás seguro de que quieres eliminar a ${clienteAEliminar?.Nombre || ''} ${clienteAEliminar?.Apellidos || ''}? Esta acción no se puede deshacer.`"
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
const clientes = ref([])
const pending = ref(true) // Iniciar como true para mostrar loading
const error = ref(null)
const showModalConfirmacion = ref(false)
const clienteAEliminar = ref(null)
const mostrarNotificacion = ref(false)
const mensajeNotificacion = ref('')

// Clave para localStorage
const STORAGE_KEY = 'clients_table_cache'

// Columnas de la tabla
const columnas = ['Nombre', 'Apellidos', 'Dirección', 'Teléfono', 'Correo']

// Función para mostrar notificación
const mostrarNotificacionExito = (mensaje) => {
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Datos formateados para la tabla
const clientesFormateados = computed(() => {
    console.log('🔄 Formateando clientes:', clientes.value.length)
    return clientes.value.map(cliente => ({
        Nombre: cliente.nombre || 'N/A',
        Apellidos: cliente.apellido || 'N/A',
        Dirección: cliente.direccion || 'N/A',
        Teléfono: cliente.telefono || 'N/A',
        Correo: cliente.correo || 'N/A',
        idClient: cliente.idClient
    }))
})

// Función para guardar en localStorage
const saveToLocalStorage = (data) => {
    if (process.client) {
        try {
            console.log('💾 Guardando en localStorage:', data.length, 'clientes')
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            
            // Verificar que se guardó
            const verify = localStorage.getItem(STORAGE_KEY)
            const verifiedData = verify ? JSON.parse(verify) : []
            console.log('✅ Verificación - Datos guardados:', verifiedData.length, 'clientes')
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
                console.log('✅ Datos cargados desde cache:', parsedData.length, 'clientes')
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

// Función para obtener clientes desde el backend
const fetchClientes = async () => {
    console.log('🚀 Iniciando fetchClientes...')
    pending.value = true
    error.value = null
    
    try {
        console.log('🌐 Haciendo petición a la API...')
        
        // Usar $fetch en lugar de useFetch para mejor control
        const data = await $fetch('http://localhost:4000/client', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        console.log('📨 Respuesta completa de la API:', data)
        
        if (data && data['Todos los clientes']) {
            clientes.value = data['Todos los clientes']
            console.log('✅ Clientes asignados desde "Todos los clientes":', clientes.value.length)
        } else if (data && Array.isArray(data)) {
            clientes.value = data
            console.log('✅ Clientes asignados (array directo):', clientes.value.length)
        } else {
            clientes.value = []
            console.warn('⚠️  No se encontraron clientes en la respuesta o formato inesperado:', data)
        }

        // Guardar en cache solo si tenemos datos
        if (clientes.value.length > 0) {
            saveToLocalStorage(clientes.value)
        }
        
    } catch (err) {
        error.value = err
        console.error('❌ Error fetching clients:', err)
        
        // Intentar cargar del cache como respaldo
        console.log('🔄 Intentando cargar desde cache por error...')
        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            clientes.value = cachedData
            error.value = null // Limpiar error porque tenemos cache
            console.log('✅ Recuperados desde cache después de error:', clientes.value.length)
        } else {
            console.log('📭 No hay cache disponible')
        }
    } finally {
        pending.value = false
        console.log('🏁 Fetch completado. Total clientes:', clientes.value.length)
    }
}

// Métodos para manejar eventos
const editarCliente = (cliente) => {
    console.log('✏️ Editar cliente:', cliente)
    navigateTo(`/clients/formularioCliente?edit=${cliente.idClient}`)
}

const iniciarEliminacion = (cliente) => {
    clienteAEliminar.value = cliente
    showModalConfirmacion.value = true
}

const confirmarEliminacion = async () => {
    if (clienteAEliminar.value) {
        try {
            const idAEliminar = clienteAEliminar.value.idClient
            
            if (!idAEliminar) {
                throw new Error('ID del cliente no encontrado')
            }
            
            await eliminarClienteBackend(idAEliminar)
            
            const index = clientes.value.findIndex(cliente => 
                cliente.idClient === idAEliminar
            )
            
            if (index !== -1) {
                const nombreCompleto = `${clienteAEliminar.value.Nombre} ${clienteAEliminar.value.Apellidos}`
                clientes.value.splice(index, 1)
                
                // Mostrar notificación de éxito
                mostrarNotificacionExito(`Cliente "${nombreCompleto}" eliminado correctamente`)
            }

            // Actualizar cache después de eliminar
            saveToLocalStorage(clientes.value)
            
            showModalConfirmacion.value = false
            clienteAEliminar.value = null
            
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar el cliente. Por favor, intenta nuevamente.')
        }
    }
}

const cancelarEliminacion = () => {
    showModalConfirmacion.value = false
    clienteAEliminar.value = null
}

// Función para eliminar en el backend
const eliminarClienteBackend = async (idClient) => {
    try {
        await $fetch(`http://localhost:4000/client/${idClient}`, {
            method: 'DELETE'
        })
        console.log('✅ Cliente eliminado correctamente del backend')
        
    } catch (err) {
        console.error('❌ Error eliminando cliente:', err)
        throw new Error('No se pudo eliminar el cliente')
    }
}

// Cargar clientes al montar el componente
onMounted(() => {
    console.log('🎬 Componente montado - Iniciando carga...')
    
    // Primero cargar desde cache inmediatamente
    const cachedData = loadFromLocalStorage()
    if (cachedData && cachedData.length > 0) {
        clientes.value = cachedData
        pending.value = false // Ya tenemos datos, no mostrar loading
        console.log('✅ Cache cargado al montar:', clientes.value.length, 'clientes')
    } else {
        console.log('📭 No hay datos en cache al montar')
    }
    
    // Siempre intentar cargar datos frescos
    fetchClientes()
})

// Watcher para debug
watch(clientes, (newVal) => {
    console.log('👀 Clientes actualizados:', newVal.length)
}, { deep: false })
</script>