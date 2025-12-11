<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-6xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                {{ esEdicion ? 'Editar Proyecto' : 'Agregar Proyecto' }}
            </h1>
            
            <form @submit.prevent="esEdicion ? actualizarProyecto() : agregarProyecto()" class="flex flex-col gap-6 w-full">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <!-- Columna izquierda -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Nombre del Proyecto:</label>
                            <InputGenerico
                                v-model="formData.nombre"
                                placeholder="Ingrese el nombre del proyecto"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Costo:</label>
                            <InputGenerico
                                v-model="formData.costo"
                                type="number"
                                step="0.01"
                                placeholder="Ingrese el costo"
                                @keypress="soloNumeros"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Fecha de Inicio:</label>
                            <InputGenerico
                                v-model="formData.fechaInicio"
                                type="date"
                                placeholder="Seleccione la fecha de inicio"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Fecha Fin:</label>
                            <InputGenerico
                                v-model="formData.fechaFin"
                                type="date"
                                placeholder="Seleccione la fecha de fin"
                            />
                        </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Estado:</label>
                            <select
                                v-model="formData.estado"
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-petrona text-gray-700 bg-white"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Activo">Activo</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Cliente:</label>
                            <select
                                v-model="formData.clienteId"
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-petrona text-gray-700 bg-white"
                            >
                                <option value="">Seleccione un cliente</option>
                                <option 
                                    v-for="cliente in clientes" 
                                    :key="cliente.idClient" 
                                    :value="cliente.idClient"
                                >
                                    {{ cliente.nombre }} {{ cliente.apellido }}
                                </option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Equipos Asignados:</label>
                            <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white p-4">
                                <div 
                                    v-for="equipo in equipos" 
                                    :key="equipo.idEquipo || equipo.idTeam"
                                    class="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        :id="`equipo-${equipo.idEquipo || equipo.idTeam}`"
                                        :value="equipo.idEquipo || equipo.idTeam"
                                        v-model="formData.equiposSeleccionados"
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label 
                                        :for="`equipo-${equipo.idEquipo || equipo.idTeam}`"
                                        class="font-petrona text-gray-700 cursor-pointer flex-1"
                                    >
                                        {{ equipo.especialidad }}
                                    </label>
                                </div>
                                <div v-if="equipos.length === 0" class="text-gray-500 text-center py-4">
                                    No hay equipos disponibles
                                </div>
                            </div>
                            <p class="text-sm text-gray-300 mt-1">
                                {{ formData.equiposSeleccionados.length }} equipo(s) seleccionado(s)
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Descripción (textarea que ocupa todo el ancho) -->
                <div class="flex flex-col gap-2 w-full">
                    <label class="font-petrona text-white text-base font-semibold">Descripción:</label>
                    <textarea
                        v-model="formData.descripcion"
                        placeholder="Ingrese la descripción del proyecto"
                        rows="4"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-petrona text-gray-700 bg-white resize-none"
                    ></textarea>
                </div>

                <div class="flex gap-4 justify-center mt-6 w-full">
                    <NuxtLink to="/projects/gestionProyectos" class="flex-1" @click="limpiarStorage">
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
const proyectoId = computed(() => route.query.edit)

console.log('🔍 [DEBUG] Parámetros de URL:', {
    esEdicion: esEdicion.value,
    proyectoId: proyectoId.value,
    query: route.query
})

// Reactive data
const formData = reactive({
    nombre: '',
    costo: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    estado: 'Pendiente',
    clienteId: '',
    equiposSeleccionados: []
})

console.log('🔍 [DEBUG] FormData inicializado:', JSON.parse(JSON.stringify(formData)))

// Estados para equipos, clientes y notificación
const equipos = ref([])
const clientes = ref([])
const equiposPending = ref(false)
const clientesPending = ref(false)
const mostrarNotificacion = ref(false)
const tipoNotificacion = ref('exito')
const tituloNotificacion = ref('')
const mensajeNotificacion = ref('')

// Claves para localStorage
const STORAGE_KEYS = {
    FORM_DATA: 'proyecto_form_data',
    IS_EDITING: 'proyecto_is_editing',
    PROYECTO_ID: 'proyecto_id'
}

// URLs de las APIs - CORREGIDAS
const API_ENDPOINTS = {
    agregarProyecto: 'http://localhost:4000/proyect',
    actualizarProyecto: (id) => `http://localhost:4000/proyect/${id}`,
    obtenerProyecto: (id) => `http://localhost:4000/proyect/${id}`,
    equipos: 'http://localhost:4000/team',
    clientes: 'http://localhost:4000/client'
}

// Método para mostrar notificaciones
const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    console.log(`🔍 [DEBUG] Mostrando toast: ${tipo} - ${titulo} - ${mensaje}`)
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Guardar datos en localStorage
const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
            localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
            if (proyectoId.value) {
                localStorage.setItem(STORAGE_KEYS.PROYECTO_ID, proyectoId.value)
            }
            console.log('🔍 [DEBUG] Datos guardados en localStorage:', JSON.parse(JSON.stringify(formData)))
        } catch (error) {
            console.error('🔍 [DEBUG] Error guardando en localStorage:', error)
        }
    }
}

// Cargar datos desde localStorage
const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
            const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
            const savedProyectoId = localStorage.getItem(STORAGE_KEYS.PROYECTO_ID)
            
            console.log('🔍 [DEBUG] Intentando cargar desde localStorage:', {
                savedFormData: savedFormData ? 'Presente' : 'Ausente',
                savedIsEditing,
                savedProyectoId
            })
            
            if (savedFormData) {
                const parsedData = JSON.parse(savedFormData)
                Object.assign(formData, parsedData)
                console.log('🔍 [DEBUG] Datos cargados desde localStorage:', JSON.parse(JSON.stringify(formData)))
            }
            
            // Verificar si estamos en el mismo contexto de edición
            if (savedIsEditing && savedProyectoId) {
                const isEditing = JSON.parse(savedIsEditing)
                if (isEditing && savedProyectoId === proyectoId.value) {
                    console.log('✅ Cargando datos guardados del formulario')
                }
            }
        } catch (error) {
            console.error('🔍 [DEBUG] Error cargando desde localStorage:', error)
        }
    }
}

// Limpiar localStorage
const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.PROYECTO_ID)
        console.log('🔍 [DEBUG] localStorage limpiado')
    }
}

// Usar el composable para obtener el token
const { getAuthHeaders, hasToken } = useAuthToken()

// Función para obtener equipos desde el backend
const fetchEquipos = async () => {
    equiposPending.value = true
    console.log('🔍 [DEBUG] Iniciando fetchEquipos...')
    try {
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        const response = await $fetch(API_ENDPOINTS.equipos, {
            headers: getAuthHeaders()
        })
        console.log('🔍 [DEBUG] Respuesta completa de equipos:', response)
        
        if (response && response['Todos los equipos']) {
            equipos.value = response['Todos los equipos']
            console.log('🔍 [DEBUG] Equipos cargados (con clave):', equipos.value)
        } else if (Array.isArray(response)) {
            equipos.value = response
            console.log('🔍 [DEBUG] Equipos cargados (array directo):', equipos.value)
        } else {
            equipos.value = []
            console.log('🔍 [DEBUG] No se encontraron equipos, array vacío')
        }
    } catch (error) {
        console.error('🔍 [DEBUG] Error en fetchEquipos:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'No se pudieron cargar los equipos')
    } finally {
        equiposPending.value = false
        console.log('🔍 [DEBUG] fetchEquipos completado')
    }
}

// Función para obtener clientes desde el backend
const fetchClientes = async () => {
    clientesPending.value = true
    console.log('🔍 [DEBUG] Iniciando fetchClientes...')
    try {
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        const response = await $fetch(API_ENDPOINTS.clientes, {
            headers: getAuthHeaders()
        })
        console.log('🔍 [DEBUG] Respuesta completa de clientes:', response)
        
        if (response && response['Todos los clientes']) {
            clientes.value = response['Todos los clientes']
            console.log('🔍 [DEBUG] Clientes cargados (con clave):', clientes.value)
        } else if (Array.isArray(response)) {
            clientes.value = response
            console.log('🔍 [DEBUG] Clientes cargados (array directo):', clientes.value)
        } else {
            clientes.value = []
            console.log('🔍 [DEBUG] No se encontraron clientes, array vacío')
        }
    } catch (error) {
        console.error('🔍 [DEBUG] Error en fetchClientes:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'No se pudieron cargar los clientes')
    } finally {
        clientesPending.value = false
        console.log('🔍 [DEBUG] fetchClientes completado')
    }
}

// Cargar datos del proyecto si estamos en modo edición
const cargarProyecto = async () => {
    console.log('🔍 [DEBUG] Iniciando cargarProyecto...')
    try {
        // Primero verificar si hay datos en cache
        const cachedData = localStorage.getItem(`proyecto_cache_${proyectoId.value}`)
        console.log('🔍 [DEBUG] Cache del proyecto:', cachedData ? 'Presente' : 'Ausente')
        
        if (cachedData) {
            const proyectoCache = JSON.parse(cachedData)
            Object.assign(formData, {
                nombre: proyectoCache.nombre,
                costo: proyectoCache.costo,
                fechaInicio: proyectoCache.fechaInicio,
                fechaFin: proyectoCache.fechaFin,
                descripcion: proyectoCache.descripcion,
                estado: proyectoCache.estado,
                clienteId: proyectoCache.clientId || proyectoCache.clienteId || '', // Compatible con ambos
                equiposSeleccionados: proyectoCache.teams || proyectoCache.equipos || [] // Compatible con ambos
            })
            console.log('✅ Proyecto cargado desde cache:', JSON.parse(JSON.stringify(formData)))
        }

        // Siempre hacer la petición para tener datos actualizados
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        console.log('🔍 [DEBUG] Haciendo petición a API para proyecto:', proyectoId.value)
        const response = await $fetch(API_ENDPOINTS.obtenerProyecto(proyectoId.value), {
            headers: getAuthHeaders()
        })
        console.log('🔍 [DEBUG] Respuesta completa del proyecto:', response)
        
        if (response && response['Proyecto solicitado']) {
            const proyecto = response['Proyecto solicitado']
            console.log('🔍 [DEBUG] Proyecto encontrado:', proyecto)
            
            // Formatear fechas para el input type="date"
            const formatDateForInput = (dateString) => {
                if (!dateString) return ''
                const date = new Date(dateString)
                return date.toISOString().split('T')[0]
            }
            
            // Actualizar el formulario con los datos del proyecto
            // USAR LOS NOMBRES CORRECTOS DEL BACKEND
            Object.assign(formData, {
                nombre: proyecto.nombre,
                costo: proyecto.costo,
                fechaInicio: formatDateForInput(proyecto.fechaInicio),
                fechaFin: formatDateForInput(proyecto.fechaFin),
                descripcion: proyecto.descripcion,
                estado: proyecto.estado,
                clienteId: proyecto.clientId || '', // Usar clientId del backend
                equiposSeleccionados: proyecto.teams || [] // Usar teams del backend
            })
            
            // Guardar en cache
            localStorage.setItem(`proyecto_cache_${proyectoId.value}`, JSON.stringify(proyecto))
            
            console.log('✅ Proyecto cargado correctamente:', JSON.parse(JSON.stringify(formData)))
        } else {
            console.error('🔍 [DEBUG] No se encontró el proyecto en la respuesta')
        }
    } catch (error) {
        console.error('🔍 [DEBUG] Error al cargar proyecto:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'No se pudo cargar la información del proyecto')
    }
}

// Inicializar componente
onMounted(async () => {
    // Verificar si hay token antes de cargar datos
    if (!hasToken()) {
        console.warn('⚠️ No hay token, redirigiendo al login...')
        await navigateTo('/login')
        return
    }

    console.log('🔍 [DEBUG] Componente montado, iniciando carga de datos...')
    await Promise.all([fetchEquipos(), fetchClientes()])
    console.log('🔍 [DEBUG] Datos básicos cargados:', {
        equiposCount: equipos.value.length,
        clientesCount: clientes.value.length
    })
    
    if (esEdicion.value && proyectoId.value) {
        console.log('🔍 [DEBUG] Modo edición detectado, cargando proyecto...')
        await cargarProyecto()
    } else {
        console.log('🔍 [DEBUG] Modo creación, cargando datos guardados...')
        // Si no es edición, cargar datos guardados del formulario
        cargarDesdeStorage()
    }
    
    console.log('🔍 [DEBUG] Estado final del formulario:', JSON.parse(JSON.stringify(formData)))
})

// Watch para guardar automáticamente cuando cambien los datos del formulario
watch(formData, () => {
    console.log('🔍 [DEBUG] FormData cambiado, guardando en storage...')
    guardarEnStorage()
}, { deep: true })

// Watch para guardar cuando cambie el modo edición
watch(esEdicion, () => {
    console.log('🔍 [DEBUG] Modo edición cambiado:', esEdicion.value)
    guardarEnStorage()
})

// Watch para guardar cuando cambie el ID del proyecto
watch(proyectoId, () => {
    console.log('🔍 [DEBUG] ID del proyecto cambiado:', proyectoId.value)
    guardarEnStorage()
})

// Método para agregar proyecto - ESTRUCTURA CORREGIDA SEGÚN BACKEND
const agregarProyecto = async () => {
    console.log('🔍 [DEBUG] Iniciando agregarProyecto...')
    console.log('🔍 [DEBUG] Datos del formulario:', JSON.parse(JSON.stringify(formData)))
    
    try {
        // Validar campos requeridos
        const camposRequeridos = {
            nombre: formData.nombre,
            costo: formData.costo,
            fechaInicio: formData.fechaInicio,
            estado: formData.estado,
            clienteId: formData.clienteId
        }
        
        console.log('🔍 [DEBUG] Validando campos requeridos:', camposRequeridos)
        
        const camposFaltantes = Object.entries(camposRequeridos)
            .filter(([key, value]) => !value)
            .map(([key]) => key)
        
        if (camposFaltantes.length > 0) {
            console.error('🔍 [DEBUG] Campos requeridos faltantes:', camposFaltantes)
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos')
            return
        }

        // Validar que fecha fin no sea anterior a fecha inicio
        if (formData.fechaFin && new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
            console.error('🔍 [DEBUG] Fecha fin anterior a fecha inicio')
            mostrarToast('advertencia', 'Fechas inválidas', 'La fecha fin no puede ser anterior a la fecha de inicio')
            return
        }

        // PREPARAR DATOS CON LA ESTRUCTURA EXACTA QUE ESPERA EL BACKEND
        const datosEnvio = {
            nombre: formData.nombre.trim(),
            costo: parseFloat(formData.costo),
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin || null,
            descripcion: formData.descripcion?.trim() || '',
            clientId: formData.clienteId, // IMPORTANTE: clientId (con t minúscula)
            teams: Array.isArray(formData.equiposSeleccionados) ? formData.equiposSeleccionados : [], // IMPORTANTE: teams (no equipos)
            estado: formData.estado
        }

        console.log('🔍 [DEBUG] Datos preparados para enviar (ESTRUCTURA BACKEND):', datosEnvio)
        console.log('🔍 [DEBUG] Verificación estructura backend:', {
            tiene_nombre: !!datosEnvio.nombre,
            tiene_costo: !!datosEnvio.costo,
            tiene_fechaInicio: !!datosEnvio.fechaInicio,
            tiene_clientId: !!datosEnvio.clientId, // Verificar que se envíe correctamente
            tiene_teams: Array.isArray(datosEnvio.teams),
            tiene_estado: !!datosEnvio.estado
        })

        // Validar que el clientId sea un UUID válido
        if (!datosEnvio.clientId || datosEnvio.clientId.length < 10) {
            console.error('🔍 [DEBUG] clientId inválido:', datosEnvio.clientId)
            mostrarToast('error', 'Error', 'ID de cliente inválido')
            return
        }

        // Enviar datos al servidor
        console.log('🔍 [DEBUG] Enviando petición POST a', API_ENDPOINTS.agregarProyecto)
        console.log('🔍 [DEBUG] Body enviado:', JSON.stringify(datosEnvio, null, 2))
        
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        const response = await $fetch(API_ENDPOINTS.agregarProyecto, {
            method: 'POST',
            body: datosEnvio,
            headers: getAuthHeaders()
        })

        console.log('🔍 [DEBUG] Respuesta del servidor EXITOSA:', response)
        mostrarToast('exito', 'Éxito', 'Proyecto agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
        
        // Redirigir después de éxito
        setTimeout(() => {
            navigateTo('/projects/gestionProyectos')
        }, 1500)
        
    } catch (error) {
        console.error('🔍 [DEBUG] Error completo al agregar proyecto:', error)
        
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        
        console.error('🔍 [DEBUG] Mensaje de error:', error.message)
        console.error('🔍 [DEBUG] Stack trace:', error.stack)
        
        let mensajeError = 'Error al agregar proyecto. Por favor, intente nuevamente.'
        
        if (error.data) {
            console.error('🔍 [DEBUG] Datos del error (500):', error.data)
            
            // Intentar extraer mensaje específico del backend
            if (typeof error.data === 'string') {
                // Si es HTML, buscar el mensaje de error
                const match = error.data.match(/<pre>(.*?)<\/pre>/)
                if (match) {
                    mensajeError = `Error del servidor: ${match[1]}`
                }
            } else if (error.data.message) {
                mensajeError = error.data.message
            } else if (error.data.error) {
                mensajeError = error.data.error
            }
        }
        
        console.error('🔍 [DEBUG] Mensaje final de error:', mensajeError)
        mostrarToast('error', 'Error', mensajeError)
    }
}

// Método para actualizar proyecto - ESTRUCTURA CORREGIDA SEGÚN BACKEND
const actualizarProyecto = async () => {
    console.log('🔍 [DEBUG] Iniciando actualizarProyecto...')
    console.log('🔍 [DEBUG] Datos del formulario:', JSON.parse(JSON.stringify(formData)))
    
    try {
        // Validar campos requeridos
        if (!formData.nombre || !formData.costo || !formData.fechaInicio || !formData.estado || !formData.clienteId) {
            console.error('🔍 [DEBUG] Campos requeridos faltantes en actualización')
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Validar que fecha fin no sea anterior a fecha inicio
        if (formData.fechaFin && new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
            console.error('🔍 [DEBUG] Fecha fin anterior a fecha inicio en actualización')
            mostrarToast('advertencia', 'Fechas inválidas', 'La fecha fin no puede ser anterior a la fecha de inicio')
            return
        }

        // PREPARAR DATOS CON LA ESTRUCTURA EXACTA QUE ESPERA EL BACKEND
        const datosActualizacion = {
            nombre: formData.nombre.trim(),
            costo: parseFloat(formData.costo),
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin || null,
            descripcion: formData.descripcion?.trim() || '',
            clientId: formData.clienteId, // IMPORTANTE: clientId (con t minúscula)
            teams: Array.isArray(formData.equiposSeleccionados) ? formData.equiposSeleccionados : [], // IMPORTANTE: teams (no equipos)
            estado: formData.estado
        }

        console.log('🔍 [DEBUG] Datos preparados para actualizar (ESTRUCTURA BACKEND):', datosActualizacion)

        // Actualizar datos en el servidor
        const endpointActualizacion = API_ENDPOINTS.actualizarProyecto(proyectoId.value)
        console.log(`🔍 [DEBUG] Enviando petición PUT a`, endpointActualizacion)
        console.log('🔍 [DEBUG] Body enviado:', JSON.stringify(datosActualizacion, null, 2))
        
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        const response = await $fetch(endpointActualizacion, {
            method: 'PUT',
            body: datosActualizacion,
            headers: getAuthHeaders()
        })

        console.log('🔍 [DEBUG] Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Proyecto actualizado correctamente')
        
        // Limpiar cache y storage
        localStorage.removeItem(`proyecto_cache_${proyectoId.value}`)
        limpiarStorage()
        
        // Navegar de vuelta a la gestión de proyectos después de actualizar
        setTimeout(() => {
            navigateTo('/projects/gestionProyectos')
        }, 1500)
        
    } catch (error) {
        console.error('🔍 [DEBUG] Error completo al actualizar proyecto:', error)
        
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        
        console.error('🔍 [DEBUG] Mensaje de error:', error.message)
        console.error('🔍 [DEBUG] Stack trace:', error.stack)
        
        let mensajeError = 'Error al actualizar proyecto. Por favor, intente nuevamente.'
        
        if (error.data) {
            console.error('🔍 [DEBUG] Datos del error:', error.data)
            mensajeError = error.data.message || mensajeError
        }
        
        mostrarToast('error', 'Error', mensajeError)
    }
}

// Función para solo números
const soloNumeros = (event) => {
    const key = event.key
    // Permitir solo números y teclas de control
    if (!/^\d$/.test(key) && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.'].includes(key)) {
        event.preventDefault()
        return false
    }
    return true
}

// Limpiar formulario
const limpiarFormulario = () => {
    console.log('🔍 [DEBUG] Limpiando formulario...')
    formData.nombre = ''
    formData.costo = ''
    formData.fechaInicio = ''
    formData.fechaFin = ''
    formData.descripcion = ''
    formData.estado = 'Pendiente'
    formData.clienteId = ''
    formData.equiposSeleccionados = []
    console.log('🔍 [DEBUG] Formulario limpiado:', JSON.parse(JSON.stringify(formData)))
}
</script>