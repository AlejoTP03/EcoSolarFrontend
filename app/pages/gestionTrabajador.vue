<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Trabajadores</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/formularioTrabajador">
                        <BottonAgregar 
                            :button-text="'Agregar Trabajador'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando trabajadores...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded m-4">
            <p>Error al cargar los trabajadores: {{ error.message }}</p>
            <button 
                @click="fetchTrabajadores" 
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="trabajadoresFormateados"
                @edit="editarTrabajador"
                @delete="iniciarEliminacion"
            />
        </div>

        <!-- Modal de confirmación -->
        <ModalConfirmacion 
            :show="showModalConfirmacion"
            :titulo="'Eliminar Trabajador'"
            :mensaje="`¿Estás seguro de que quieres eliminar a ${trabajadorAEliminar?.Nombre || ''} ${trabajadorAEliminar?.Apellido || ''}? Esta acción no se puede deshacer.`"
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
const trabajadores = ref([])
const equipos = ref([]) // Lista de equipos disponibles
const especialidadesEquipos = ref({}) // Cache para especialidades
const pending = ref(false)
const error = ref(null)
const showModalConfirmacion = ref(false)
const trabajadorAEliminar = ref(null)

// Claves para localStorage
const STORAGE_KEYS = {
    WORKERS_TABLE: 'workers_table_cache'
}

// Columnas de la tabla
const columnas = ['Nombre', 'Apellido', 'Salario', 'Equipo']

// Función para obtener la especialidad de un equipo por su ID
const obtenerEspecialidadEquipo = async (idEquipo) => {
    // Si ya está en el cache, retornarlo
    if (especialidadesEquipos.value[idEquipo]) {
        return especialidadesEquipos.value[idEquipo]
    }
    
    // Si no está en el cache, obtenerlo de la API
    try {
        const response = await $fetch(`http://localhost:4000/team/${idEquipo}/especialidad`)
        
        if (response && response['Especialidad del equipo']) {
            const especialidad = response['Especialidad del equipo'].especialidad
            // Guardar en cache para futuras consultas
            especialidadesEquipos.value[idEquipo] = especialidad
            return especialidad
        }
        
        return null
    } catch (error) {
        console.error(`Error al obtener especialidad del equipo ${idEquipo}:`, error)
        return null
    }
}

// Función para cargar equipos disponibles
const fetchEquipos = async () => {
    try {
        const response = await $fetch('http://localhost:4000/team')
        
        if (response && response['Todos los equipos']) {
            equipos.value = response['Todos los equipos']
            // Crear un mapa de especialidades por ID de equipo
            // El backend usa idEquipo, pero también verificamos idTeam por compatibilidad
            equipos.value.forEach(equipo => {
                const idEquipo = equipo.idEquipo || equipo.idTeam
                if (idEquipo && equipo.especialidad) {
                    especialidadesEquipos.value[idEquipo] = equipo.especialidad
                }
            })
        } else if (Array.isArray(response)) {
            equipos.value = response
            response.forEach(equipo => {
                const idEquipo = equipo.idEquipo || equipo.idTeam
                if (idEquipo && equipo.especialidad) {
                    especialidadesEquipos.value[idEquipo] = equipo.especialidad
                }
            })
        }
        
        console.log('Equipos cargados:', equipos.value)
    } catch (error) {
        console.error('Error al cargar equipos:', error)
    }
}

// Datos formateados para la tabla con especialidades
const trabajadoresFormateados = computed(() => {
    return trabajadores.value.map(trabajador => {
        const teamId = trabajador.teamId || trabajador.idEquipo || trabajador.equipo
        let especialidad = 'Sin equipo'
        
        if (teamId) {
        // Buscar en el cache de especialidades
        especialidad = especialidadesEquipos.value[teamId] || 'Cargando...'
        }
        
        return {
        Nombre: trabajador.nombre,
        Apellido: trabajador.apellido,
        Salario: trabajador.salario ? `$${trabajador.salario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
        Equipo: especialidad,
        idWorker: trabajador.idWorker || trabajador.id,
        // Mantenemos el id del equipo para uso interno
        idEquipo: teamId
        }
    })
})

// Función para obtener trabajadores desde el backend
const fetchTrabajadores = async () => {
  // Si ya hay cache cargado, no ocultar la tabla mientras refrescamos
    pending.value = trabajadores.value.length === 0
    error.value = null
    
    try {
        // Cargar equipos primero
        await fetchEquipos()
        
        const { data } = await useFetch('http://localhost:4000/worker', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
        })
        
    if (data.value && data.value['Todos los trabajadores']) {
        trabajadores.value = data.value['Todos los trabajadores']
        } else if (data.value && Array.isArray(data.value)) {
        trabajadores.value = data.value
        } else {
        trabajadores.value = []
        }

    // Guardar tabla en cache
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WORKERS_TABLE, JSON.stringify(trabajadores.value))
    }
        
        // Cargar especialidades de los equipos de los trabajadores que no estén en el cache
        const idsEquiposUnicos = [...new Set(
        trabajadores.value
            .map(t => t.teamId || t.idEquipo || t.equipo)
            .filter(id => id && !especialidadesEquipos.value[id])
        )]
        
        // Cargar especialidades faltantes usando la ruta específica
        await Promise.all(
        idsEquiposUnicos.map(idEquipo => obtenerEspecialidadEquipo(idEquipo))
        )
        
    } catch (err) {
        error.value = err
        console.error('Error fetching workers:', err)
    } finally {
        pending.value = false
    }
}

// Métodos para manejar eventos
const agregarTrabajador = () => {
    console.log('Agregar nuevo trabajador')
}

const editarTrabajador = (trabajador) => {
    console.log('Editar trabajador:', trabajador)
    // Navegar al formulario con el ID del trabajador
    navigateTo(`/formularioTrabajador?edit=${trabajador.idWorker}`)
}

// Eliminación con modal personalizado
const iniciarEliminacion = (trabajador) => {
    trabajadorAEliminar.value = trabajador
    showModalConfirmacion.value = true
}

const confirmarEliminacion = async () => {
    if (trabajadorAEliminar.value) {
        try {
            await eliminarTrabajadorBackend(trabajadorAEliminar.value.idWorker)
            
            // Actualización local inmediata (sin recargar del backend)
            const index = trabajadores.value.findIndex(trabajador => 
                (trabajador.idWorker || trabajador.id) === trabajadorAEliminar.value.idWorker
            )
            
            if (index !== -1) {
                trabajadores.value.splice(index, 1)
            }
            
            // Cerrar modal y limpiar
            showModalConfirmacion.value = false
            trabajadorAEliminar.value = null
            
        } catch (error) {
            console.error('Error al eliminar:', error)
            alert('Error al eliminar el trabajador. Por favor, intenta nuevamente.')
        }
    }
}

const cancelarEliminacion = () => {
    showModalConfirmacion.value = false
    trabajadorAEliminar.value = null
}

// Función para eliminar en el backend
const eliminarTrabajadorBackend = async (idWorker) => {
    try {
        await $fetch(`http://localhost:4000/worker/${idWorker}`, {
            method: 'DELETE'
        })
        // Recargar la lista después de eliminar
        fetchTrabajadores()
        
        console.log('Trabajador eliminado correctamente')
        
    } catch (err) {
        console.error('Error eliminando trabajador:', err)
        throw new Error('No se pudo eliminar el trabajador')
    }
}

// Cargar trabajadores al montar el componente (usar cache primero y luego refrescar)
onMounted(() => {
    if (typeof window !== 'undefined') {
        const cache = localStorage.getItem(STORAGE_KEYS.WORKERS_TABLE)
        if (cache) {
            try { trabajadores.value = JSON.parse(cache) } catch { /* noop */ }
        }
    }
    fetchTrabajadores()
})

// Cuando se vuelve a esta página (si está cacheada por Nuxt), refrescar
onActivated?.(() => {
    fetchTrabajadores()
})
</script>