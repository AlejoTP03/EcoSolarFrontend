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
                    <NuxtLink to="/workers/gestionTrabajador" class="flex-1" @click="limpiarStorage">
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
import InputGenerico from '~/components/InputGenerico.vue'
import ButtonGenerico from '~/components/ButtonGenerico.vue'
import NotificacionEsquina from '~/components/NotificacionEsquina.vue'

const route = useRoute()
const esEdicion = computed(() => !!route.query.edit || !!route.query.update)
const trabajadorId = computed(() => route.query.edit || route.query.update)

const formData = reactive({
    nombre: '',
    apellido: '',
    salario: '', 
    teamId: ''
})

const equipos = ref([])
const equiposPending = ref(false)
const mostrarNotificacion = ref(false)
const tipoNotificacion = ref('exito')
const tituloNotificacion = ref('')
const mensajeNotificacion = ref('')

const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

const normalizeTeamId = (value) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
    return value
}

const STORAGE_KEYS = {
    FORM_DATA: 'worker_form_data',
    IS_EDITING: 'worker_is_editing',
    WORKER_ID: 'worker_id'
}

const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
        localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
        if (trabajadorId.value) {
            localStorage.setItem(STORAGE_KEYS.WORKER_ID, trabajadorId.value)
        }
    }
}

const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedWorkerId = localStorage.getItem(STORAGE_KEYS.WORKER_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            Object.assign(formData, parsedData)
        }
        
        if (savedIsEditing && savedWorkerId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedWorkerId === trabajadorId.value) {
            }
        }
    }
}

const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.WORKER_ID)
    }
}

const isEmptyString = (value) => value == null || (typeof value === 'string' && value.trim() === '')
const isInvalidSalario = (value) => value == null || (typeof value === 'string' && value.trim() === '') || isNaN(Number(value))

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

const cargarTrabajador = async () => {
    try {
        if (route.query.update) {
            const cacheKey = `trabajador_cache_${trabajadorId.value}`
            const cachedData = localStorage.getItem(cacheKey)
            
            if (cachedData) {
                const trabajadorCache = JSON.parse(cachedData)
                Object.assign(formData, {
                    nombre: trabajadorCache.nombre,
                    apellido: trabajadorCache.apellido,
                    salario: trabajadorCache.salario,
                    teamId: trabajadorCache.teamId
                })
                localStorage.removeItem(cacheKey)
                return
            }
        }

        const response = await $fetch('http://localhost:4000/worker')
        
        let todosLosTrabajadores = []
        
        if (response && response['Todos los trabajadores']) {
            todosLosTrabajadores = response['Todos los trabajadores']
        } else if (Array.isArray(response)) {
            todosLosTrabajadores = response
        } else if (response && response['Trabajadores encontrados']) {
            todosLosTrabajadores = response['Trabajadores encontrados']
        }
        
        const trabajadorEncontrado = todosLosTrabajadores.find(t => {
            const idTrabajador = t.idTrabajador || t.idWorker || t.id
            return idTrabajador === trabajadorId.value
        })
        
        if (trabajadorEncontrado) {
            Object.assign(formData, {
                nombre: trabajadorEncontrado.nombre ?? '',
                apellido: trabajadorEncontrado.apellido ?? '',
                salario: trabajadorEncontrado.salario?.toString?.() ?? '',
                teamId: trabajadorEncontrado.teamId ?? trabajadorEncontrado.equipo ?? ''
            })
            
            if (process.client) {
                const cacheData = {
                    nombre: trabajadorEncontrado.nombre,
                    apellido: trabajadorEncontrado.apellido,
                    salario: trabajadorEncontrado.salario?.toString?.(),
                    teamId: trabajadorEncontrado.teamId ?? trabajadorEncontrado.equipo
                }
                localStorage.setItem(`trabajador_cache_${trabajadorId.value}`, JSON.stringify(cacheData))
            }
        } else {
            mostrarToast('error', 'Error', 'No se encontraron datos del trabajador')
        }
        
    } catch (error) {
        mostrarToast('error', 'Error', 'No se pudo cargar la información del trabajador')
    }
}

onMounted(async () => {
    await fetchEquipos()
    
    if (esEdicion.value && trabajadorId.value) {
        await cargarTrabajador()
    } else {
        cargarDesdeStorage()
    }
})

watch(formData, () => {
    guardarEnStorage()
}, { deep: true })

watch(esEdicion, () => {
    guardarEnStorage()
})

watch(trabajadorId, () => {
    guardarEnStorage()
})

const agregarTrabajador = async () => {
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

        const response = await $fetch('http://localhost:4000/worker', {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' }
        })

        mostrarToast('exito', 'Éxito', 'Trabajador agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
    } catch (error) {
        mostrarToast('error', 'Error', 'Error al agregar trabajador. Por favor, intente nuevamente.')
    }
}

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

        const response = await $fetch(`http://localhost:4000/worker/${trabajadorId.value}`, {
            method: 'PUT',
            body,
            headers: { 'Content-Type': 'application/json' }
        })

        mostrarToast('exito', 'Éxito', 'Trabajador actualizado correctamente')
        
        if (process.client) {
            localStorage.removeItem(`trabajador_cache_${trabajadorId.value}`)
        }
        limpiarStorage()

        setTimeout(() => {
            navigateTo('/gestionTrabajador')
        }, 1500)
    } catch (error) {
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