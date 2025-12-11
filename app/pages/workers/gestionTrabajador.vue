<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Trabajadores</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/workers/formularioTrabajador">
                        <BottonAgregar 
                            :button-text="'Agregar Trabajador'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending && trabajadores.length === 0" class="text-center py-8">
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

        <!-- Mostrar cuando no hay datos -->
        <div v-else-if="trabajadores.length === 0" class="text-center py-8">
            <p class="text-gray-600 text-lg">No hay trabajadores para mostrar</p>
            <button 
                @click="fetchTrabajadores" 
                class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                Cargar Trabajadores
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="trabajadoresFormateados"
                @edit="editarTrabajador"
                @delete="iniciarEliminacion"
                @update="actualizarTrabajador"
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
    import TablaGenerica from '~/components/TablaGenerica.vue'
    import BottonAgregar from '~/components/BottonAgregar.vue'
    import ModalConfirmacion from '~/components/ModalConfirmacion.vue'
    import NotificacionEsquina from '~/components/NotificacionEsquina.vue'

    const trabajadores = ref([])
    const equipos = ref([])
    const especialidadesEquipos = ref({})
    const pending = ref(true)
    const error = ref(null)
    const showModalConfirmacion = ref(false)
    const trabajadorAEliminar = ref(null)
    const mostrarNotificacion = ref(false)
    const mensajeNotificacion = ref('')

    const STORAGE_KEY = 'workers_table_cache'
    const columnas = ['Nombre', 'Apellido', 'Salario', 'Equipo']

    const mostrarNotificacionExito = (mensaje) => {
        mensajeNotificacion.value = mensaje
        mostrarNotificacion.value = true
    }

    // Usar el composable para obtener el token
    const { getAuthHeaders, hasToken } = useAuthToken()

    const obtenerEspecialidadEquipo = async (idEquipo) => {
        if (especialidadesEquipos.value[idEquipo]) {
            return especialidadesEquipos.value[idEquipo]
        }
        
        try {
            if (!hasToken()) {
                await navigateTo('/login')
                return null
            }

            const response = await $fetch(`http://localhost:4000/team/${idEquipo}/especialidad`, {
                headers: getAuthHeaders()
            })
            
            if (response && response['Especialidad del equipo']) {
                const especialidad = response['Especialidad del equipo'].especialidad
                especialidadesEquipos.value[idEquipo] = especialidad
                return especialidad
            }
            
            return null
        } catch (error) {
            if (error?.status === 401 || error?.statusCode === 401) {
                await navigateTo('/login')
            }
            return null
        }
    }

    const fetchEquipos = async () => {
        try {
            if (!hasToken()) {
                await navigateTo('/login')
                return
            }

            const response = await $fetch('http://localhost:4000/team', {
                headers: getAuthHeaders()
            })
            
            if (response && response['Todos los equipos']) {
                equipos.value = response['Todos los equipos']
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
        } catch (error) {
            if (error?.status === 401 || error?.statusCode === 401) {
                await navigateTo('/login')
            }
        }
    }

    const trabajadoresFormateados = computed(() => {
        return trabajadores.value.map(trabajador => {
            const teamId = trabajador.teamId || trabajador.idEquipo || trabajador.equipo
            let especialidad = 'Sin equipo'
            
            if (teamId) {
                especialidad = especialidadesEquipos.value[teamId] || 'Cargando...'
            }
            
            const idTrabajador = trabajador.idTrabajador
            
            return {
                Nombre: trabajador.nombre || 'N/A',
                Apellido: trabajador.apellido || 'N/A',
                Salario: trabajador.salario ? `$${trabajador.salario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
                Equipo: especialidad,
                idTrabajador: idTrabajador,
                idWorker: idTrabajador,
                id: idTrabajador,
                idEquipo: teamId
            }
        })
    })

    const saveToLocalStorage = (data) => {
        if (process.client) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            } catch (e) {
            }
        }
    }

    const loadFromLocalStorage = () => {
        if (process.client) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY)
                if (stored) {
                    return JSON.parse(stored)
                }
            } catch (e) {
            }
        }
        return null
    }

    const fetchTrabajadores = async () => {
        // Verificar token antes de hacer la petición
        if (!hasToken()) {
            console.warn('⚠️ No hay token de autenticación')
            error.value = new Error('No autenticado. Por favor, inicia sesión.')
            await navigateTo('/login')
            return
        }

        pending.value = true
        error.value = null
        
        try {
            await fetchEquipos()
            
            const data = await $fetch('http://localhost:4000/worker', {
                method: 'GET',
                headers: getAuthHeaders()
            })
            
            if (data && data['Todos los trabajadores']) {
                trabajadores.value = data['Todos los trabajadores']
            } else if (data && Array.isArray(data)) {
                trabajadores.value = data
            } else {
                trabajadores.value = []
            }

            if (trabajadores.value.length > 0) {
                saveToLocalStorage(trabajadores.value)
            }
            
            const idsEquiposUnicos = [...new Set(
                trabajadores.value
                    .map(t => t.teamId || t.idEquipo || t.equipo)
                    .filter(id => id && !especialidadesEquipos.value[id])
            )]
            
            await Promise.all(
                idsEquiposUnicos.map(idEquipo => obtenerEspecialidadEquipo(idEquipo))
            )
            
        } catch (err) {
            error.value = err
            
            // Si es error 401, el token puede ser inválido
            if (err?.status === 401 || err?.statusCode === 401) {
                console.warn('⚠️ Token inválido o expirado, redirigiendo al login...')
                await navigateTo('/login')
                return
            }
            
            const cachedData = loadFromLocalStorage()
            if (cachedData && cachedData.length > 0) {
                trabajadores.value = cachedData
                error.value = null
            }
        } finally {
            pending.value = false
        }
    }

    const editarTrabajador = (trabajador) => {
        navigateTo(`/workers/formularioTrabajador?edit=${trabajador.idTrabajador}`)
    }

    const actualizarTrabajador = (trabajador) => {
        let salarioProcesado = ''
        if (trabajador.Salario && trabajador.Salario !== 'N/A') {
            salarioProcesado = trabajador.Salario.replace('$', '')
                                                .replace(/\./g, '')
                                                .replace(',', '.')
        }
        
        if (process.client) {
            const cacheData = {
                nombre: trabajador.Nombre || '',
                apellido: trabajador.Apellido || '',
                salario: salarioProcesado,
                teamId: trabajador.idEquipo || ''
            }
            
            const cacheKey = `trabajador_cache_${trabajador.idTrabajador}`
            localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        }
        
        navigateTo(`/formularioTrabajador?update=${trabajador.idTrabajador}`)
    }

    const iniciarEliminacion = (trabajador) => {
        trabajadorAEliminar.value = trabajador
        showModalConfirmacion.value = true
    }

    const confirmarEliminacion = async () => {
        if (trabajadorAEliminar.value) {
            try {
                const idAEliminar = trabajadorAEliminar.value.idTrabajador
                
                if (!idAEliminar) {
                    throw new Error('ID del trabajador no encontrado')
                }
                
                await eliminarTrabajadorBackend(idAEliminar)
                
                const index = trabajadores.value.findIndex(trabajador => {
                    return trabajador.idTrabajador === idAEliminar
                })
                
                if (index !== -1) {
                    const nombreCompleto = `${trabajadorAEliminar.value.Nombre} ${trabajadorAEliminar.value.Apellido}`
                    trabajadores.value.splice(index, 1)
                    
                    mostrarNotificacionExito(`Trabajador "${nombreCompleto}" eliminado correctamente`)
                }

                saveToLocalStorage(trabajadores.value)
                
                showModalConfirmacion.value = false
                trabajadorAEliminar.value = null
                
            } catch (error) {
                alert('Error al eliminar el trabajador. Por favor, intenta nuevamente.')
            }
        }
    }

    const cancelarEliminacion = () => {
        showModalConfirmacion.value = false
        trabajadorAEliminar.value = null
    }

    const eliminarTrabajadorBackend = async (idTrabajador) => {
        try {
            // Verificar token antes de eliminar
            if (!hasToken()) {
                await navigateTo('/login')
                throw new Error('No autenticado')
            }

            await $fetch(`http://localhost:4000/worker/${idTrabajador}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
        } catch (err) {
            // Si es error 401, redirigir al login
            if (err?.status === 401 || err?.statusCode === 401) {
                await navigateTo('/login')
            }
            throw new Error('No se pudo eliminar el trabajador')
        }
    }

    onMounted(async () => {
        // Verificar si hay token antes de cargar datos
        if (!hasToken()) {
            console.warn('⚠️ No hay token, redirigiendo al login...')
            await navigateTo('/login')
            return
        }

        const cachedData = loadFromLocalStorage()
        if (cachedData && cachedData.length > 0) {
            trabajadores.value = cachedData
            pending.value = false
        }
        
        fetchTrabajadores()
    })
</script>