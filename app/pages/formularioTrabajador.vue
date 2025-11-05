<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-6xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                {{ esEdicion ? 'Editar Trabajador' : 'Agregar Trabajador' }}
            </h1>

            <form @submit.prevent="esEdicion ? actualizarTrabajador() : agregarTrabajador()" class="flex flex-col gap-6 w-full">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <!-- Columna izquierda -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Nombre:</label>
                            <InputGenerico
                                v-model="formData.nombre"
                                placeholder="Ingrese el nombre"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Apellido:</label>
                            <InputGenerico
                                v-model="formData.apellido"
                                placeholder="Ingrese el apellido"
                            />
                        </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Salario:</label>
                            <InputGenerico
                                v-model="formData.salario"
                                type="number"
                                step="0.01"
                                placeholder="Ingrese el salario"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Equipo:</label>
                            <select
                                v-model="formData.teamId"
                                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-petrona text-gray-700 bg-white"
                            >
                                <option value="">Seleccione un equipo</option>
                                <option 
                                    v-for="equipo in equipos" 
                                    :key="equipo.idEquipo || equipo.idTeam" 
                                    :value="equipo.idEquipo || equipo.idTeam"
                                >
                                    {{ equipo.especialidad }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 justify-center mt-6 w-full">
                    <NuxtLink to="/gestionTrabajador" class="flex-1" @click="limpiarStorage">
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
const trabajadorId = computed(() => route.query.edit)

// Reactive data
const formData = reactive({
    nombre: '',
    apellido: '',
    salario: '', 
    teamId: '' // Cambiado de 'equipo' a 'teamId'
})

// Estado para equipos disponibles
const equipos = ref([])
const equiposPending = ref(false)

// Estado para la notificación
const mostrarNotificacion = ref(false)
const tipoNotificacion = ref('exito')
const tituloNotificacion = ref('')
const mensajeNotificacion = ref('')

// Método para mostrar notificaciones
const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Normaliza el teamId a número si es numérico, o deja string (UUID) si no
const normalizeTeamId = (value) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
    return value
}

// Claves para localStorage del formulario
const STORAGE_KEYS = {
    FORM_DATA: 'worker_form_data',
    IS_EDITING: 'worker_is_editing',
    WORKER_ID: 'worker_id'
}

// Guardar datos en localStorage
const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
        localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
        if (trabajadorId.value) {
            localStorage.setItem(STORAGE_KEYS.WORKER_ID, trabajadorId.value)
        }
    }
}

// Cargar datos desde localStorage
const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedWorkerId = localStorage.getItem(STORAGE_KEYS.WORKER_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            Object.assign(formData, parsedData)
        }
        
        // Verificar si estamos en el mismo contexto de edición
        if (savedIsEditing && savedWorkerId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedWorkerId === trabajadorId.value) {
                console.log('✅ Cargando datos guardados del formulario de trabajador')
            }
        }
    }
}

// Limpiar localStorage del formulario
const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.WORKER_ID)
    }
}

// Validaciones de campos
const isEmptyString = (value) => value == null || (typeof value === 'string' && value.trim() === '')
const isInvalidSalario = (value) => value == null || (typeof value === 'string' && value.trim() === '') || isNaN(Number(value))

// Función para cargar equipos disponibles
const fetchEquipos = async () => {
    equiposPending.value = true
    try {
        const response = await $fetch('http://localhost:4000/team')
        
        // Ajustar según la estructura de tu API
        if (response && response['Todos los equipos']) {
            equipos.value = response['Todos los equipos']
        } else if (Array.isArray(response)) {
            equipos.value = response
        } else {
            equipos.value = []
        }
        
        console.log('Equipos cargados:', equipos.value)
    } catch (error) {
        console.error('Error al cargar equipos:', error)
        mostrarToast('error', 'Error', 'No se pudieron cargar los equipos')
    } finally {
        equiposPending.value = false
    }
}

// Cargar datos del trabajador si estamos en modo edición
onMounted(async () => {
    await fetchEquipos()
    
    if (esEdicion.value && trabajadorId.value) {
        await cargarTrabajador()
    } else {
        // Si no es edición, cargar datos guardados del formulario
        cargarDesdeStorage()
    }
})

// Función para cargar datos del trabajador
const cargarTrabajador = async () => {
    try {
        const response = await $fetch(`http://localhost:4000/worker/${trabajadorId.value}`)

        // Ajustar según respuesta de la API
        const trabajador = response?.['Trabajador solicitado'] || response
        if (trabajador) {
            Object.assign(formData, {
                nombre: trabajador.nombre ?? '',
                apellido: trabajador.apellido ?? '',
                salario: trabajador.salario?.toString?.() ?? '',
                teamId: trabajador.teamId ?? trabajador.equipo ?? '' // Manejar ambos nombres
            })
            console.log('✅ Trabajador cargado correctamente:', formData)
        }
    } catch (error) {
        console.error('Error al cargar trabajador:', error)
        mostrarToast('error', 'Error', 'No se pudo cargar la información del trabajador')
    }
}

// Método para agregar trabajador
const agregarTrabajador = async () => {
    try {
        // Validar campos requeridos (permitir salario 0, normalizar espacios)
        if (isEmptyString(formData.nombre) || isEmptyString(formData.apellido) || isInvalidSalario(formData.salario) || isEmptyString(formData.teamId)) {
            mostrarToast('advertencia', 'Campos requeridos', 'Nombre, Apellido, Salario y Equipo son obligatorios')
            return
        }

        const body = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            salario: Number(formData.salario),
            teamId: normalizeTeamId(formData.teamId)
        }

        console.log('Enviando datos:', body)

        const response = await $fetch('http://localhost:4000/worker', {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' }
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Trabajador agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
    } catch (error) {
        console.error('Error al agregar trabajador:', error)
        mostrarToast('error', 'Error', 'Error al agregar trabajador. Por favor, intente nuevamente.')
    }
}

// Método para actualizar trabajador
const actualizarTrabajador = async () => {
    try {
        if (isEmptyString(formData.nombre) || isEmptyString(formData.apellido) || isInvalidSalario(formData.salario) || isEmptyString(formData.teamId)) {
            mostrarToast('advertencia', 'Campos requeridos', 'Nombre, Apellido, Salario y Equipo son obligatorios')
            return
        }

        const body = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            salario: Number(formData.salario),
            teamId: normalizeTeamId(formData.teamId)
        }

        console.log('Actualizando con datos:', body)

        const response = await $fetch(`http://localhost:4000/worker/${trabajadorId.value}`, {
            method: 'PUT',
            body,
            headers: { 'Content-Type': 'application/json' }
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Trabajador actualizado correctamente')
        limpiarStorage()

        setTimeout(() => {
            navigateTo('/gestionTrabajador')
        }, 1500)
    } catch (error) {
        console.error('Error al actualizar trabajador:', error)
        mostrarToast('error', 'Error', 'Error al actualizar trabajador. Por favor, intente nuevamente.')
    }
}

const limpiarFormulario = () => {
    formData.nombre = ''
    formData.apellido = ''
    formData.salario = ''
    formData.teamId = ''
}
</script>