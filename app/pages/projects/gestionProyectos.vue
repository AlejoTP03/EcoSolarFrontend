<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Proyectos</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/projects/formularioProyecto">
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

        <!-- Contenido de la tabla CON EL NUEVO COMPONENTE -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenericaConEstados 
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
// Importar componentes - USANDO EL NUEVO COMPONENTE
import TablaGenericaConEstados from '~/components/TablaGenericaConEstados.vue'
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

// Columnas de la tabla
const columnas = ['Nombre', 'Costo', 'Fechas', 'Estado', 'Cliente', 'Equipos', 'Descripción']

// Función para obtener clase de color según el estado
const obtenerClaseEstado = (estado) => {
    const estadoLower = estado?.toLowerCase() || ''
    
    switch(estadoLower) {
        case 'pendiente':
            return 'estado-pendiente'
        case 'activo':
            return 'estado-activo'
        case 'finalizado':
            return 'estado-finalizado'
        case 'cancelado':
            return 'estado-cancelado'
        default:
            return 'estado-default'
    }
}

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
        if (!hasToken()) {
            await navigateTo('/')
            return []
        }

        console.log(`🔍 [GET] Obteniendo equipos para proyecto: ${proyectoId}`)
        
        const response = await $fetch(`http://localhost:4000/proyect/${proyectoId}/teams`, {
            headers: getAuthHeaders()
        })
        console.log(`✅ Respuesta equipos proyecto ${proyectoId}:`, response)
        
        // MANEJAR LA ESTRUCTURA ESPECÍFICA DE LA RESPUESTA
        if (response && response['Equipos del proyecto']) {
            // La API devuelve: { "Equipos del proyecto": ["Electricidad", "Pintura", "Demolición"] }
            return response['Equipos del proyecto']
        } else if (Array.isArray(response)) {
            // Si la respuesta es directamente un array
            return response
        }
        
        return []
    } catch (error) {
        console.error(`❌ Error obteniendo equipos para proyecto ${proyectoId}:`, error)
        
        // Si es error 401, redirigir al login
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
            return []
        }
        
        // Si el endpoint no existe, retornar array vacío
        if (error.status === 404) {
            console.warn(`⚠️ Endpoint /proyect/${proyectoId}/teams no encontrado, retornando array vacío`)
            return []
        }
        
        return []
    }
}

// Cargar equipos para todos los proyectos
const cargarEquiposProyectos = async () => {
    console.log('🔄 Iniciando carga de equipos para proyectos...')
    
    const promesasEquipos = proyectos.value.map(async (proyecto) => {
        try {
            const equipos = await obtenerEquiposProyecto(proyecto.idProyect)
            proyectosConEquipos.value[proyecto.idProyect] = equipos
            console.log(`✅ Equipos cargados para proyecto ${proyecto.idProyect}:`, equipos)
        } catch (error) {
            console.error(`❌ Error cargando equipos para proyecto ${proyecto.idProyect}:`, error)
            proyectosConEquipos.value[proyecto.idProyect] = []
        }
    })
    
    await Promise.all(promesasEquipos)
    console.log('✅ Todos los equipos cargados:', proyectosConEquipos.value)
}

// Formatear la lista de equipos para mostrar - MOSTRAR TODOS SIEMPRE
const formatearEquipos = (proyectoId) => {
    const equipos = proyectosConEquipos.value[proyectoId] || []
    
    console.log(`🔍 Formateando equipos para proyecto ${proyectoId}:`, equipos)
    
    if (equipos.length === 0) {
        return 'Sin equipos asignados'
    }
    
    // OPCIÓN 5: SIMPLEMENTE MOSTRAR TODOS LOS EQUIPOS
    return equipos.join(', ')
}

// Datos formateados para la tabla - CON COLORES PARA ESTADO
const proyectosFormateados = computed(() => {
    return proyectos.value.map(proyecto => {
        const fechaInicio = new Date(proyecto.fechaInicio).toLocaleDateString('es-ES')
        const fechaFin = proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString('es-ES') : 'Sin definir'
        
        // Descripción truncada si es muy larga
        const descripcionCorta = proyecto.descripcion && proyecto.descripcion.length > 80 
            ? proyecto.descripcion.substring(0, 80) + '...' 
            : proyecto.descripcion || 'Sin descripción'
        
        const equiposFormateados = formatearEquipos(proyecto.idProyect)
        const claseEstado = obtenerClaseEstado(proyecto.estado)
        
        console.log(`📊 Proyecto ${proyecto.idProyect} - Equipos formateados:`, equiposFormateados)
        
        return {
            Nombre: proyecto.nombre || 'N/A',
            Costo: proyecto.costo ? `$${proyecto.costo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
            Fechas: `${fechaInicio} - ${fechaFin}`,
            Estado: {
                texto: proyecto.estado || 'N/A',
                clase: claseEstado
            },
            Cliente: obtenerNombreCliente(proyecto.clientId),
            Equipos: equiposFormateados,
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

// Usar el composable para obtener el token
const { getAuthHeaders, hasToken } = useAuthToken()

// Función para obtener clientes
const fetchClientes = async () => {
    try {
        if (!hasToken()) {
            await navigateTo('/')
            return
        }

        const response = await $fetch('http://localhost:4000/client', {
            headers: getAuthHeaders()
        })
        if (response && response['Todos los clientes']) {
            clientes.value = response['Todos los clientes']
        } else if (Array.isArray(response)) {
            clientes.value = response
        }
    } catch (error) {
        console.error('Error cargando clientes:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
        }
    }
}

// Función para obtener proyectos desde el backend
const fetchProyectos = async () => {
    // Verificar token antes de hacer la petición
    if (!hasToken()) {
        console.warn('⚠️ No hay token de autenticación')
        error.value = new Error('No autenticado. Por favor, inicia sesión.')
        await navigateTo('/')
        return
    }

    pending.value = true
    error.value = null
    
    try {
        console.log('🚀 Iniciando carga de proyectos...')
        
        // Cargar clientes primero
        await fetchClientes()
        console.log('✅ Clientes cargados:', clientes.value.length)
        
        // Cargar proyectos
        const data = await $fetch('http://localhost:4000/proyect', {
            method: 'GET',
            headers: getAuthHeaders()
        })
        
        console.log('📨 Respuesta proyectos:', data)
        
        if (data && data['Todos los proyectos']) {
            proyectos.value = data['Todos los proyectos']
        } else if (data && Array.isArray(data)) {
            proyectos.value = data
        } else {
            proyectos.value = []
        }

        console.log('✅ Proyectos cargados:', proyectos.value.length)

        // Cargar equipos para cada proyecto
        if (proyectos.value.length > 0) {
            console.log('🔄 Cargando equipos para proyectos...')
            await cargarEquiposProyectos()
            saveToLocalStorage(proyectos.value)
            console.log('💾 Datos guardados en localStorage')
        }
        
    } catch (err) {
        error.value = err
        console.error('❌ Error fetching projects:', err)
        
        // Si es error 401, el token puede ser inválido
        if (err?.status === 401 || err?.statusCode === 401) {
            console.warn('⚠️ Token inválido o expirado, redirigiendo al login...')
            await navigateTo('/')
            return
        }
        
        // Intentar cargar del cache como respaldo
        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            proyectos.value = cachedData
            error.value = null
            console.log('✅ Datos cargados desde cache')
        }
    } finally {
        pending.value = false
        console.log('🏁 Carga de proyectos completada')
    }
}

// Métodos para manejar eventos
const editarProyecto = (proyecto) => {
    console.log('✏️ Editando proyecto:', proyecto)
    navigateTo(`/projects/formularioProyecto?edit=${proyecto.idProyect}`)
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
const eliminarProyectoBackend = async (proyectoId) => {
    try {
        // Verificar token antes de eliminar
        if (!hasToken()) {
            await navigateTo('/')
            throw new Error('No autenticado')
        }

        console.log(`🗑️ [DELETE] Eliminando proyecto: ${proyectoId}`)
        
        const response = await $fetch(`http://localhost:4000/proyect/${proyectoId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
        
        console.log('✅ Proyecto eliminado correctamente:', response)
        return { success: true, data: response }
        
    } catch (error) {
        console.error('❌ Error eliminando proyecto:', error)
        console.error('🔍 Detalles del error:', {
            message: error.message,
            status: error.status,
            url: error.url
        })
        
        // Si es error 401, redirigir al login
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
        }
        
        throw new Error('No se pudo eliminar el proyecto')
    }
}

// Cargar proyectos al montar el componente
onMounted(async () => {
    // Verificar si hay token antes de cargar datos
    if (!hasToken()) {
        console.warn('⚠️ No hay token, redirigiendo al login...')
        await navigateTo('/')
        return
    }

    console.log('🎬 Componente montado - Iniciando carga...')
    const cachedData = loadFromLocalStorage()
    if (cachedData && cachedData.length > 0) {
        proyectos.value = cachedData
        pending.value = false
        console.log('✅ Cache cargado al montar:', proyectos.value.length)
    }
    
    fetchProyectos()
})
</script>