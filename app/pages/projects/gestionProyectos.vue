<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Proyectos</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/proyectos/formularioProyecto">
                        <BottonAgregar 
                            :button-text="'Agregar Proyecto'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending && proyectos.length === 0" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando proyectos...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded m-4">
            <p>Error al cargar los proyectos: {{ error.message }}</p>
            <button 
                @click="fetchProyectos" 
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        </div>

        <!-- Mostrar cuando no hay datos -->
        <div v-else-if="proyectos.length === 0" class="text-center py-8">
            <p class="text-gray-600 text-lg">No hay proyectos para mostrar</p>
            <button 
                @click="fetchProyectos" 
                class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                Cargar Proyectos
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="proyectosFormateados"
                @edit="editarProyecto"
                @delete="iniciarEliminacion"
            />
        </div>

        <!-- Modal de confirmación -->
        <ModalConfirmacion 
            :show="showModalConfirmacion"
            :titulo="'Eliminar Proyecto'"
            :mensaje="`¿Estás seguro de que quieres eliminar el proyecto ${proyectoAEliminar?.Nombre || ''}? Esta acción no se puede deshacer.`"
            @confirm="confirmarEliminacion"
            @cancel="cancelarEliminacion"
        />

        <!-- Modal de equipos -->
        <ModalEquipos 
            :show="showModalEquipos"
            :equipos="equiposModal"
            :titulo="`Equipos del proyecto: ${proyectoSeleccionado?.nombre || ''}`"
            @cerrar="showModalEquipos = false"
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
import ModalEquipos from '~/components/ModalEquipos.vue'

// Estados reactivos
const proyectos = ref([])
const clientes = ref([])
const equipos = ref([])
const pending = ref(true)
const error = ref(null)
const showModalConfirmacion = ref(false)
const showModalEquipos = ref(false)
const proyectoAEliminar = ref(null)
const proyectoSeleccionado = ref(null)
const equiposModal = ref([])
const mostrarNotificacion = ref(false)
const mensajeNotificacion = ref('')

// Clave para localStorage
const STORAGE_KEY = 'projects_table_cache'

// Columnas de la tabla
const columnas = ['Nombre', 'Costo', 'Fechas', 'Estado', 'Cliente', 'Equipos', 'Descripción']

// Función para mostrar notificación
const mostrarNotificacionExito = (mensaje) => {
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Obtener nombre del cliente por ID
const obtenerNombreCliente = (clientId) => {
    const cliente = clientes.value.find(c => c.idClient === clientId)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no encontrado'
}

// Obtener equipos del proyecto
const obtenerEquiposProyecto = async (proyectoId) => {
    try {
        const response = await $fetch(`http://localhost:4000/project/${proyectoId}/teams`)
        if (response && response['Equipos del proyecto']) {
            return response['Equipos del proyecto']
        }
        return []
    } catch (error) {
        console.error('Error obteniendo equipos:', error)
        return []
    }
}

// Formatear estado con colores
const formatearEstado = (estado) => {
    const colores = {
        'Pendiente': 'bg-orange-100 text-orange-800 border-orange-200',
        'Activo': 'bg-blue-100 text-blue-800 border-blue-200',
        'Finalizado': 'bg-green-100 text-green-800 border-green-200'
    }
    
    const colorClase = colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
    
    return {
        texto: estado,
        clase: `px-3 py-1 rounded-full text-sm font-medium border ${colorClase}`
    }
}

// Datos formateados para la tabla
const proyectosFormateados = computed(() => {
    console.log('🔄 Formateando proyectos:', proyectos.value.length)
    return proyectos.value.map(proyecto => {
        const estadoFormateado = formatearEstado(proyecto.estado)
        const fechaInicio = new Date(proyecto.fechaInicio).toLocaleDateString('es-ES')
        const fechaFin = proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString('es-ES') : 'Sin definir'
        
        return {
            Nombre: proyecto.nombre || 'N/A',
            Costo: proyecto.costo ? `$${proyecto.costo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
            Fechas: `${fechaInicio} - ${fechaFin}`,
            Estado: estadoFormateado,
            Cliente: obtenerNombreCliente(proyecto.clientId),
            Equipos: {
                cantidad: 0, // Se cargará después
                proyectoId: proyecto.idProyect
            },
            Descripción: {
                texto: proyecto.descripcion || 'Sin descripción',
                expandido: false
            },
            idProyect: proyecto.idProyect
        }
    })
})

// Función para cargar equipos de todos los proyectos
const cargarEquiposProyectos = async () => {
    for (const proyecto of proyectosFormateados.value) {
        try {
            const equiposProyecto = await obtenerEquiposProyecto(proyecto.idProyect)
            proyecto.Equipos.cantidad = equiposProyecto.length
            // Guardar los equipos para el modal
            proyecto.Equipos.lista = equiposProyecto
        } catch (error) {
            console.error(`Error cargando equipos para proyecto ${proyecto.idProyect}:`, error)
            proyecto.Equipos.cantidad = 0
            proyecto.Equipos.lista = []
        }
    }
}

// Función para mostrar modal de equipos
const mostrarEquipos = async (proyecto) => {
    proyectoSeleccionado.value = proyectos.value.find(p => p.idProyect === proyecto.idProyect)
    
    // Si ya tenemos los equipos cargados, usarlos
    if (proyecto.Equipos.lista) {
        equiposModal.value = proyecto.Equipos.lista
    } else {
        // Si no, cargarlos
        equiposModal.value = await obtenerEquiposProyecto(proyecto.idProyect)
    }
    
    showModalEquipos.value = true
}

// Función para guardar en localStorage
const saveToLocalStorage = (data) => {
    if (process.client) {
        try {
            console.log('💾 Guardando en localStorage:', data.length, 'proyectos')
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
            if (stored) {
                const parsedData = JSON.parse(stored)
                console.log('✅ Datos cargados desde cache:', parsedData.length, 'proyectos')
                return parsedData
            }
        } catch (e) {
            console.error('❌ Error leyendo localStorage:', e)
        }
    }
    return null
}

// Función para obtener clientes
const fetchClientes = async () => {
    try {
        const response = await $fetch('http://localhost:4000/client')
        if (response && response['Todos los clientes']) {
            clientes.value = response['Todos los clientes']
        } else if (Array.isArray(response)) {
            clientes.value = response
        }
    } catch (error) {
        console.error('Error cargando clientes:', error)
    }
}

// Función para obtener proyectos desde el backend
const fetchProyectos = async () => {
    console.log('🚀 Iniciando fetchProyectos...')
    pending.value = true
    error.value = null
    
    try {
        console.log('🌐 Haciendo petición a la API...')
        
        // Cargar clientes primero
        await fetchClientes()
        
        // Cargar proyectos
        const data = await $fetch('http://localhost:4000/proyect', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        console.log('📨 Respuesta completa de la API:', data)
        
        if (data && data['Todos los proyectos']) {
            proyectos.value = data['Todos los proyectos']
            console.log('✅ Proyectos asignados desde "Todos los proyectos":', proyectos.value.length)
            
            // Cargar equipos para cada proyecto
            await cargarEquiposProyectos()
        } else if (data && Array.isArray(data)) {
            proyectos.value = data
            console.log('✅ Proyectos asignados (array directo):', proyectos.value.length)
            
            // Cargar equipos para cada proyecto
            await cargarEquiposProyectos()
        } else {
            proyectos.value = []
            console.warn('⚠️  No se encontraron proyectos en la respuesta o formato inesperado:', data)
        }

        // Guardar en cache solo si tenemos datos
        if (proyectos.value.length > 0) {
            saveToLocalStorage(proyectos.value)
        }
        
    } catch (err) {
        error.value = err
        console.error('❌ Error fetching projects:', err)
        
        // Intentar cargar del cache como respaldo
        console.log('🔄 Intentando cargar desde cache por error...')
        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            proyectos.value = cachedData
            error.value = null
            console.log('✅ Recuperados desde cache después de error:', proyectos.value.length)
        } else {
            console.log('📭 No hay cache disponible')
        }
    } finally {
        pending.value = false
        console.log('🏁 Fetch completado. Total proyectos:', proyectos.value.length)
    }
}

// Métodos para manejar eventos
const editarProyecto = (proyecto) => {
    console.log('✏️ Editar proyecto:', proyecto)
    navigateTo(`/proyectos/formularioProyecto?edit=${proyecto.idProyect}`)
}

const iniciarEliminacion = (proyecto) => {
    proyectoAEliminar.value = proyecto
    showModalConfirmacion.value = true
}

const confirmarEliminacion = async () => {
    if (proyectoAEliminar.value) {
        try {
            const idAEliminar = proyectoAEliminar.value.idProyect
            
            if (!idAEliminar) {
                throw new Error('ID del proyecto no encontrado')
            }
            
            await eliminarProyectoBackend(idAEliminar)
            
            const index = proyectos.value.findIndex(proyecto => 
                proyecto.idProyect === idAEliminar
            )
            
            if (index !== -1) {
                const nombreProyecto = proyectoAEliminar.value.Nombre
                proyectos.value.splice(index, 1)
                
                // Mostrar notificación de éxito
                mostrarNotificacionExito(`Proyecto "${nombreProyecto}" eliminado correctamente`)
            }

            // Actualizar cache después de eliminar
            saveToLocalStorage(proyectos.value)
            
            showModalConfirmacion.value = false
            proyectoAEliminar.value = null
            
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar el proyecto. Por favor, intenta nuevamente.')
        }
    }
}

const cancelarEliminacion = () => {
    showModalConfirmacion.value = false
    proyectoAEliminar.value = null
}

// Función para eliminar en el backend
const eliminarProyectoBackend = async (idProyect) => {
    try {
        await $fetch(`http://localhost:4000/project/${idProyect}`, {
            method: 'DELETE'
        })
        console.log('✅ Proyecto eliminado correctamente del backend')
        
    } catch (err) {
        console.error('❌ Error eliminando proyecto:', err)
        throw new Error('No se pudo eliminar el proyecto')
    }
}

// Cargar proyectos al montar el componente
onMounted(() => {
    console.log('🎬 Componente montado - Iniciando carga...')
    
    // Primero cargar desde cache inmediatamente
    const cachedData = loadFromLocalStorage()
    if (cachedData && cachedData.length > 0) {
        proyectos.value = cachedData
        pending.value = false
        console.log('✅ Cache cargado al montar:', proyectos.value.length, 'proyectos')
    } else {
        console.log('📭 No hay datos en cache al montar')
    }
    
    // Siempre intentar cargar datos frescos
    fetchProyectos()
})

// Watcher para debug
watch(proyectos, (newVal) => {
    console.log('👀 Proyectos actualizados:', newVal.length)
}, { deep: false })
</script>