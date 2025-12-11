<template>
    <div class="font-petrona w-full">
        <div class="font-petrona w-full">
            <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
                <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Equipos</h2>
                
                <!-- Botón Agregar -->
                <div class="ml-auto">
                    <NuxtLink to="/teams/formularioEquipo">
                        <BottonAgregar 
                            :button-text="'Agregar Equipo'"
                        />
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="pending && equipos.length === 0" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando equipos...</p>
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-400 px-4 py-3 rounded m-4">
            <p>Error al cargar los equipos: {{ error.message }}</p>
            <button 
                @click="fetchEquipos" 
                class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
                Reintentar
            </button>
        </div>

        <!-- Mostrar cuando no hay datos -->
        <div v-else-if="equipos.length === 0" class="text-center py-8">
            <p class="text-gray-600 text-lg">No hay equipos para mostrar</p>
            <button 
                @click="fetchEquipos" 
                class="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
                Cargar Equipos
            </button>
        </div>

        <!-- Contenido de la tabla -->
        <div v-else class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="equiposFormateados"
                @edit="editarEquipo"
                @delete="iniciarEliminacion"
            />
        </div>

        <!-- Modal de confirmación -->
        <ModalConfirmacion 
            :show="showModalConfirmacion"
            :titulo="'Eliminar Equipo'"
            :mensaje="`¿Estás seguro de que quieres eliminar el equipo de ${equipoAEliminar?.Especialidad || ''}? Esta acción no se puede deshacer.`"
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
    const equipos = ref([])
    const pending = ref(true) // Iniciar como true para mostrar loading
    const error = ref(null)
    const showModalConfirmacion = ref(false)
    const equipoAEliminar = ref(null)

    // Clave para localStorage
    const STORAGE_KEY = 'equipos_table_cache'

    // Columnas de la tabla
    const columnas = ['Especialidad', 'Cantidad de Trabajadores']

    // Datos formateados para la tabla
    const equiposFormateados = computed(() => {
        console.log('🔄 Formateando equipos:', equipos.value.length)
        return equipos.value.map(equipo => ({
            Especialidad: equipo.especialidad || 'N/A',
            'Cantidad de Trabajadores': equipo.cantidadTrabajadores ?? 'N/A',
            idEquipo: equipo.idEquipo
        }))
    })

    // Función para guardar en localStorage
    const saveToLocalStorage = (data) => {
        if (process.client) {
            try {
                console.log('💾 Guardando en localStorage:', data.length, 'equipos')
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
                
                // Verificar que se guardó
                const verify = localStorage.getItem(STORAGE_KEY)
                const verifiedData = verify ? JSON.parse(verify) : []
                console.log('✅ Verificación - Datos guardados:', verifiedData.length, 'equipos')
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
                    console.log('✅ Datos cargados desde cache:', parsedData.length, 'equipos')
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

    // Función para obtener equipos desde el backend
    const fetchEquipos = async () => {
        console.log('🚀 Iniciando fetchEquipos...')
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
            const data = await $fetch('http://localhost:4000/team/workers/count', {
                method: 'GET',
                headers: getAuthHeaders()
            })
            
            console.log('📨 Respuesta completa de la API:', data)
            
            if (data && data['Equipos con cantidad de trabajadores']) {
                equipos.value = data['Equipos con cantidad de trabajadores']
                console.log('✅ Equipos asignados desde "Todos los equipos":', equipos.value.length)
            } else if (data && Array.isArray(data)) {
                equipos.value = data
                console.log('✅ Equipos asignados (array directo):', equipos.value.length)
            } else {
                equipos.value = []
                console.warn('⚠️  No se encontraron equipos en la respuesta o formato inesperado:', data)
            }

            // Guardar en cache solo si tenemos datos
            if (equipos.value.length > 0) {
                saveToLocalStorage(equipos.value)
            }
            
        } catch (err) {
            error.value = err
            console.error('❌ Error fetching teams:', err)
            
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
                equipos.value = cachedData
                error.value = null // Limpiar error porque tenemos cache
                console.log('✅ Recuperados desde cache después de error:', equipos.value.length)
            } else {
                console.log('📭 No hay cache disponible')
            }
        } finally {
            pending.value = false
            console.log('🏁 Fetch completado. Total equipos:', equipos.value.length)
        }
    }

    // Métodos para manejar eventos
    const editarEquipo = (equipo) => {
        console.log('✏️ Editar equipo:', equipo)
        navigateTo(`/teams/formularioEquipo?edit=${equipo.idEquipo}`)
    }

    const iniciarEliminacion = (equipo) => {
        equipoAEliminar.value = equipo
        showModalConfirmacion.value = true
    }

    const confirmarEliminacion = async () => {
        if (equipoAEliminar.value) {
            try {
                await eliminarEquipoBackend(equipoAEliminar.value.idEquipo)
                
                const index = equipos.value.findIndex(equipo => 
                    equipo.idEquipo === equipoAEliminar.value.idEquipo
                )
                
                if (index !== -1) {
                    equipos.value.splice(index, 1)
                    console.log('🗑️ Equipo eliminado localmente')
                }

                // Actualizar cache después de eliminar
                saveToLocalStorage(equipos.value)
                
                showModalConfirmacion.value = false
                equipoAEliminar.value = null
                
            } catch (error) {
                console.error('Error al eliminar:', error)
                alert('Error al eliminar el equipo. Por favor, intenta nuevamente.')
            }
        }
    }

    const cancelarEliminacion = () => {
        showModalConfirmacion.value = false
        equipoAEliminar.value = null
    }

    // Función para eliminar en el backend
    const eliminarEquipoBackend = async (idEquipo) => {
        try {
            // Verificar token antes de eliminar
            if (!hasToken()) {
                await navigateTo('/login')
                throw new Error('No autenticado')
            }

            await $fetch(`http://localhost:4000/team/${idEquipo}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            console.log('✅ Equipo eliminado correctamente del backend')
            
        } catch (err) {
            console.error('❌ Error eliminando equipo:', err)
            
            // Si es error 401, redirigir al login
            if (err?.status === 401 || err?.statusCode === 401) {
                await navigateTo('/login')
            }
            
            throw new Error('No se pudo eliminar el equipo')
        }
    }

    // Cargar equipos al montar el componente
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
            equipos.value = cachedData
            pending.value = false // Ya tenemos datos, no mostrar loading
            console.log('✅ Cache cargado al montar:', equipos.value.length, 'equipos')
        } else {
            console.log('📭 No hay datos en cache al montar')
        }
        
        // Siempre intentar cargar datos frescos
        fetchEquipos()
    })

    // Watcher para debug
    watch(equipos, (newVal) => {
        console.log('👀 Equipos actualizados:', newVal.length)
    }, { deep: false })
</script>