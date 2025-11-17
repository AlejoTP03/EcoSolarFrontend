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
                    <NuxtLink to="/proyectos/gestionProyectos" class="flex-1" @click="limpiarStorage">
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

// Método para mostrar notificaciones
const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Guardar datos en localStorage
const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
        localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
        if (proyectoId.value) {
            localStorage.setItem(STORAGE_KEYS.PROYECTO_ID, proyectoId.value)
        }
    }
}

// Cargar datos desde localStorage
const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedProyectoId = localStorage.getItem(STORAGE_KEYS.PROYECTO_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            Object.assign(formData, parsedData)
        }
        
        // Verificar si estamos en el mismo contexto de edición
        if (savedIsEditing && savedProyectoId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedProyectoId === proyectoId.value) {
                console.log('✅ Cargando datos guardados del formulario')
            }
        }
    }
}

// Limpiar localStorage
const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.PROYECTO_ID)
    }
}

// Función para obtener equipos desde el backend
const fetchEquipos = async () => {
    equiposPending.value = true
    try {
        const response = await $fetch('http://localhost:4000/team')
        
        if (response && response['Todos los equipos']) {
            equipos.value = response['Todos los equipos']
        } else if (Array.isArray(response)) {
            equipos.value = response
        } else {
            equipos.value = []
        }
    } catch (error) {
        mostrarToast('error', 'Error', 'No se pudieron cargar los equipos')
    } finally {
        equiposPending.value = false
    }
}

// Función para obtener clientes desde el backend
const fetchClientes = async () => {
    clientesPending.value = true
    try {
        const response = await $fetch('http://localhost:4000/client')
        
        if (response && response['Todos los clientes']) {
            clientes.value = response['Todos los clientes']
        } else if (Array.isArray(response)) {
            clientes.value = response
        } else {
            clientes.value = []
        }
    } catch (error) {
        mostrarToast('error', 'Error', 'No se pudieron cargar los clientes')
    } finally {
        clientesPending.value = false
    }
}

// Cargar datos del proyecto si estamos en modo edición
const cargarProyecto = async () => {
    try {
        // Primero verificar si hay datos en cache
        const cachedData = localStorage.getItem(`proyecto_cache_${proyectoId.value}`)
        if (cachedData) {
            const proyectoCache = JSON.parse(cachedData)
            Object.assign(formData, {
                nombre: proyectoCache.nombre,
                costo: proyectoCache.costo,
                fechaInicio: proyectoCache.fechaInicio,
                fechaFin: proyectoCache.fechaFin,
                descripcion: proyectoCache.descripcion,
                estado: proyectoCache.estado,
                clienteId: proyectoCache.clienteId || '',
                equiposSeleccionados: proyectoCache.equiposSeleccionados || []
            })
            console.log('✅ Proyecto cargado desde cache')
        }

        // Siempre hacer la petición para tener datos actualizados
        const response = await $fetch(`http://localhost:4000/project/${proyectoId.value}`)
        
        if (response && response['Proyecto solicitado']) {
            const proyecto = response['Proyecto solicitado']
            
            // Formatear fechas para el input type="date"
            const formatDateForInput = (dateString) => {
                if (!dateString) return ''
                const date = new Date(dateString)
                return date.toISOString().split('T')[0]
            }
            
            // Actualizar el formulario con los datos del proyecto
            Object.assign(formData, {
                nombre: proyecto.nombre,
                costo: proyecto.costo,
                fechaInicio: formatDateForInput(proyecto.fechaInicio),
                fechaFin: formatDateForInput(proyecto.fechaFin),
                descripcion: proyecto.descripcion,
                estado: proyecto.estado,
                clienteId: proyecto.clienteId || '',
                equiposSeleccionados: proyecto.equipos || []
            })
            
            // Guardar en cache
            localStorage.setItem(`proyecto_cache_${proyectoId.value}`, JSON.stringify(proyecto))
            
            console.log('✅ Proyecto cargado correctamente:', formData)
        }
    } catch (error) {
        console.error('Error al cargar proyecto:', error)
        mostrarToast('error', 'Error', 'No se pudo cargar la información del proyecto')
    }
}

// Inicializar componente
onMounted(async () => {
    await Promise.all([fetchEquipos(), fetchClientes()])
    
    if (esEdicion.value && proyectoId.value) {
        await cargarProyecto()
    } else {
        // Si no es edición, cargar datos guardados del formulario
        cargarDesdeStorage()
    }
})

// Watch para guardar automáticamente cuando cambien los datos del formulario
watch(formData, () => {
    guardarEnStorage()
}, { deep: true })

// Watch para guardar cuando cambie el modo edición
watch(esEdicion, () => {
    guardarEnStorage()
})

// Watch para guardar cuando cambie el ID del proyecto
watch(proyectoId, () => {
    guardarEnStorage()
})

// Método para agregar proyecto
const agregarProyecto = async () => {
    try {
        console.log('Datos del proyecto:', formData)
        
        // Validar campos requeridos
        if (!formData.nombre || !formData.costo || !formData.fechaInicio || !formData.estado || !formData.clienteId) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Validar que fecha fin no sea anterior a fecha inicio
        if (formData.fechaFin && new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
            mostrarToast('advertencia', 'Fechas inválidas', 'La fecha fin no puede ser anterior a la fecha de inicio')
            return
        }

        // Enviar datos al servidor
        const response = await $fetch('http://localhost:4000/project', {
            method: 'POST',
            body: {
                nombre: formData.nombre,
                costo: parseFloat(formData.costo),
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin || null,
                descripcion: formData.descripcion,
                estado: formData.estado,
                clienteId: formData.clienteId,
                equipos: formData.equiposSeleccionados
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Proyecto agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
        
    } catch (error) {
        console.error('Error al agregar proyecto:', error)
        mostrarToast('error', 'Error', 'Error al agregar proyecto. Por favor, intente nuevamente.')
    }
}

// Método para actualizar proyecto
const actualizarProyecto = async () => {
    try {
        console.log('Actualizando proyecto:', formData)
        
        // Validar campos requeridos
        if (!formData.nombre || !formData.costo || !formData.fechaInicio || !formData.estado || !formData.clienteId) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Validar que fecha fin no sea anterior a fecha inicio
        if (formData.fechaFin && new Date(formData.fechaFin) < new Date(formData.fechaInicio)) {
            mostrarToast('advertencia', 'Fechas inválidas', 'La fecha fin no puede ser anterior a la fecha de inicio')
            return
        }

        // Actualizar datos en el servidor
        const response = await $fetch(`http://localhost:4000/project/${proyectoId.value}`, {
            method: 'PUT',
            body: {
                nombre: formData.nombre,
                costo: parseFloat(formData.costo),
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin || null,
                descripcion: formData.descripcion,
                estado: formData.estado,
                clienteId: formData.clienteId,
                equipos: formData.equiposSeleccionados
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Proyecto actualizado correctamente')
        
        // Limpiar cache y storage
        localStorage.removeItem(`proyecto_cache_${proyectoId.value}`)
        limpiarStorage()
        
        // Navegar de vuelta a la gestión de proyectos después de actualizar
        setTimeout(() => {
            navigateTo('/proyectos/gestionProyectos')
        }, 1500)
        
    } catch (error) {
        console.error('Error al actualizar proyecto:', error)
        mostrarToast('error', 'Error', 'Error al actualizar proyecto. Por favor, intente nuevamente.')
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
    formData.nombre = ''
    formData.costo = ''
    formData.fechaInicio = ''
    formData.fechaFin = ''
    formData.descripcion = ''
    formData.estado = 'Pendiente'
    formData.clienteId = ''
    formData.equiposSeleccionados = []
}
</script>