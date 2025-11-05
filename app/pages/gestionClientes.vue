<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Clientes</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/formularioCliente">
                        <BottonAgregar 
                            :button-text="'Agregar Cliente'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending" class="text-center py-8">
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
    </div>
</template>

<script setup>
// Importar componentes
import TablaGenerica from '~/components/TablaGenerica.vue'
import BottonAgregar from '~/components/BottonAgregar.vue'
import ModalConfirmacion from '~/components/ModalConfirmacion.vue'

// Estados reactivos
const clientes = ref([])
const pending = ref(false)
const error = ref(null)
const showModalConfirmacion = ref(false)
const clienteAEliminar = ref(null)

// Claves para localStorage
const STORAGE_KEYS = {
    CLIENTS_TABLE: 'clients_table_cache'
}

// Columnas de la tabla
const columnas = ['Nombre', 'Apellidos', 'Dirección', 'Teléfono', 'Correo']

// Datos formateados para la tabla
const clientesFormateados = computed(() => {
    return clientes.value.map(cliente => ({
        Nombre: cliente.nombre,
        Apellidos: cliente.apellido,
        Dirección: cliente.direccion,
        Teléfono: cliente.telefono,
        Correo: cliente.correo,
        idClient: cliente.idClient
    }))
})

// Función para obtener clientes desde el backend
const fetchClientes = async () => {
    // Si ya hay cache cargado, no ocultar la tabla mientras refrescamos
    pending.value = clientes.value.length === 0
    error.value = null
    
    try {
        const { data } = await useFetch('http://localhost:4000/client', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (data.value && data.value['Todos los clientes']) {
            clientes.value = data.value['Todos los clientes']
        } else if (data.value && Array.isArray(data.value)) {
            // Soportar respuesta como arreglo directo
            clientes.value = data.value
        } else {
            clientes.value = []
        }

        // Guardar tabla en cache
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CLIENTS_TABLE, JSON.stringify(clientes.value))
        }
        
    } catch (err) {
        error.value = err
        console.error('Error fetching clients:', err)
    } finally {
        pending.value = false
    }
}

// Métodos para manejar eventos
const agregarCliente = () => {
    console.log('Agregar nuevo cliente')
    // Lógica para agregar cliente
}

const editarCliente = (cliente) => {
    console.log('Editar cliente:', cliente)
    // Navegar al formulario con el ID del cliente
    navigateTo(`/formularioCliente?edit=${cliente.idClient}`)
}

// Eliminación con modal personalizado
const iniciarEliminacion = (cliente) => {
    clienteAEliminar.value = cliente
    showModalConfirmacion.value = true
}

const confirmarEliminacion = async () => {
    if (clienteAEliminar.value) {
        try {
            await eliminarClienteBackend(clienteAEliminar.value.idClient)
            
            // Actualización local inmediata (sin recargar del backend)
            const index = clientes.value.findIndex(cliente => 
                cliente.idClient === clienteAEliminar.value.idClient
            )
            
            if (index !== -1) {
                clientes.value.splice(index, 1)
            }

            // Actualizar cache
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.CLIENTS_TABLE, JSON.stringify(clientes.value))
            }
            
            // Cerrar modal y limpiar
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
        // Recargar la lista después de eliminar
        fetchClientes()
        
        // Opcional: Mostrar notificación de éxito
        // Puedes agregar aquí un toast o notificación
        console.log('Cliente eliminado correctamente')
        
    } catch (err) {
        console.error('Error eliminando cliente:', err)
        throw new Error('No se pudo eliminar el cliente')
    }
}

// Cargar clientes al montar el componente
onBeforeMount(() => {
    // Hidratar desde cache lo antes posible
    if (typeof window !== 'undefined') {
        const cache = localStorage.getItem(STORAGE_KEYS.CLIENTS_TABLE)
        if (cache) {
            try { clientes.value = JSON.parse(cache) } catch { /* noop */ }
        }
    }
})

onMounted(() => {
    // Cargar cache primero
    if (typeof window !== 'undefined') {
        const cache = localStorage.getItem(STORAGE_KEYS.CLIENTS_TABLE)
        if (cache) {
            try { clientes.value = JSON.parse(cache) } catch { /* noop */ }
        }
    }
    fetchClientes()
})

// Si la página vuelve a activarse, refrescar
onActivated?.(() => {
    fetchClientes()
})
</script>