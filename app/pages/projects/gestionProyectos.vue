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
const proyectos = ref([])
const clientes = ref([])
const proyectosConEquipos = ref({}) // Para almacenar equipos por proyecto
const pending = ref(true)
const error = ref(null)
const showModalConfirmacion = ref(false)
const proyectoAEliminar = ref(null)
const mostrarNotificacion = ref(false)
const mensajeNotificacion = ref('')

// Clave para localStorage
const STORAGE_KEY = 'projects_table_cache'

// Columnas de la tabla - AGREGAMOS EQUIPOS
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

// Obtener equipos del proyecto (versión simple)
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

// Cargar equipos para todos los proyectos
const cargarEquiposProyectos = async () => {
    const promesasEquipos = proyectos.value.map(async (proyecto) => {
        const equipos = await obtenerEquiposProyecto(proyecto.idProyect)
        proyectosConEquipos.value[proyecto.idProyect] = equipos
    })
    
    await Promise.all(promesasEquipos)
}

// Formatear la lista de equipos para mostrar
const formatearEquipos = (proyectoId) => {
    const equipos = proyectosConEquipos.value[proyectoId] || []
    
    if (equipos.length === 0) {
        return 'Sin equipos'
    }
    
    // Mostrar solo los primeros 2 equipos y contar el resto
    if (equipos.length <= 2) {
        return equipos.map(e => e.especialidad || e.nombre).join(', ')
    } else {
        const primerosEquipos = equipos.slice(0, 2).map(e => e.especialidad || e.nombre)
        return `${primerosEquipos.join(', ')} +${equipos.length - 2} más`
    }
}

// Datos formateados para la tabla - AGREGAMOS EQUIPOS
const proyectosFormateados = computed(() => {
    return proyectos.value.map(proyecto => {
        const fechaInicio = new Date(proyecto.fechaInicio).toLocaleDateString('es-ES')
        const fechaFin = proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString('es-ES') : 'Sin definir'
        
        // Descripción truncada si es muy larga
        const descripcionCorta = proyecto.descripcion && proyecto.descripcion.length > 80 
            ? proyecto.descripcion.substring(0, 80) + '...' 
            : proyecto.descripcion || 'Sin descripción'
        
        return {
            Nombre: proyecto.nombre || 'N/A',
            Costo: proyecto.costo ? `$${proyecto.costo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
            Fechas: `${fechaInicio} - ${fechaFin}`,
            Estado: proyecto.estado || 'N/A',
            Cliente: obtenerNombreCliente(proyecto.clientId),
            Equipos: formatearEquipos(proyecto.idProyect),
            Descripción: descripcionCorta,
            // Campos ocultos para funcionalidad
            _equiposCompletos: proyectosConEquipos.value[proyecto.idProyect] || [],
            idProyect: proyecto.idProyect
        }
    })
})

// Función para guardar en localStorage
const saveToLocalStorage = (data) => {
    if (process.client) {
        try {
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
                return JSON.parse(stored)
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

// Función para obtener proyectos desde el backend - AGREGAMOS CARGA DE EQUIPOS
const fetchProyectos = async () => {
    pending.value = true
    error.value = null
    
    try {
        // Cargar clientes primero
        await fetchClientes()
        
        // Cargar proyectos
        const data = await $fetch('http://localhost:4000/project', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (data && data['Todos los proyectos']) {
            proyectos.value = data['Todos los proyectos']
        } else if (data && Array.isArray(data)) {
            proyectos.value = data
        } else {
            proyectos.value = []
        }

        // Cargar equipos para cada proyecto
        if (proyectos.value.length > 0) {
            await cargarEquiposProyectos()
            saveToLocalStorage(proyectos.value)
        }
        
    } catch (err) {
        error.value = err
        console.error('❌ Error fetching projects:', err)
        
        // Intentar cargar del cache como respaldo
        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            proyectos.value = cachedData
            error.value = null
        }
    } finally {
        pending.value = false
    }
}

// Métodos para manejar eventos
const editarProyecto = (proyecto) => {
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
            
            await eliminarProyectoBackend(idAEliminar)
            
            const index = proyectos.value.findIndex(proyecto => 
                proyecto.idProyect === idAEliminar
            )
            
            if (index !== -1) {
                const nombreProyecto = proyectoAEliminar.value.Nombre
                proyectos.value.splice(index, 1)
                
                // También eliminar de proyectosConEquipos
                delete proyectosConEquipos.value[idAEliminar]
                
                mostrarNotificacionExito(`Proyecto "${nombreProyecto}" eliminado correctamente`)
            }

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
    } catch (err) {
        console.error('❌ Error eliminando proyecto:', err)
        throw new Error('No se pudo eliminar el proyecto')
    }
}

// Cargar proyectos al montar el componente
onMounted(() => {
    const cachedData = loadFromLocalStorage()
    if (cachedData && cachedData.length > 0) {
        proyectos.value = cachedData
        pending.value = false
    }
    
    fetchProyectos()
})
</script>