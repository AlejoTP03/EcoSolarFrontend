<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-4xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                {{ esEdicion ? 'Editar Equipo' : 'Agregar Equipo' }}
            </h1>

            <form @submit.prevent="esEdicion ? actualizarEquipo() : agregarEquipo()" class="flex flex-col gap-6 w-full">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <!-- Columna izquierda - Campo editable -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Especialidad:</label>
                            <InputGenerico
                                v-model="formData.especialidad"
                                placeholder="Ingrese la especialidad"
                            />
                        </div>
                    </div>

                    <!-- Columna derecha - Campo no editable -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Cantidad de Trabajadores:</label>
                            <div class="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 font-petrona text-gray-500">
                                {{ formData.cantidadTrabajadores || '0' }}
                            </div>
                            <p class="text-sm text-gray-300 mt-1">Este campo se calcula automáticamente</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 justify-center mt-6 w-full">
                    <NuxtLink to="/teams/gestionEquipos" class="flex-1" @click="limpiarStorage">
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
const equipoId = computed(() => route.query.edit || route.query.update)

const formData = reactive({
    especialidad: '',
    cantidadTrabajadores: 0
})

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

const STORAGE_KEYS = {
    FORM_DATA: 'equipo_form_data',
    IS_EDITING: 'equipo_is_editing',
    EQUIPO_ID: 'equipo_id'
}

const guardarEnStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData))
        localStorage.setItem(STORAGE_KEYS.IS_EDITING, JSON.stringify(esEdicion.value))
        if (equipoId.value) {
            localStorage.setItem(STORAGE_KEYS.EQUIPO_ID, equipoId.value)
        }
    }
}

const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedEquipoId = localStorage.getItem(STORAGE_KEYS.EQUIPO_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            Object.assign(formData, parsedData)
        }
        
        if (savedIsEditing && savedEquipoId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedEquipoId === equipoId.value) {
                // Mantener los datos en edición
            }
        }
    }
}

const limpiarStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
        localStorage.removeItem(STORAGE_KEYS.IS_EDITING)
        localStorage.removeItem(STORAGE_KEYS.EQUIPO_ID)
    }
}

const isEmptyString = (value) => value == null || (typeof value === 'string' && value.trim() === '')

const cargarEquipo = async () => {
    try {
        if (route.query.update) {
            const cacheKey = `equipo_cache_${equipoId.value}`
            const cachedData = localStorage.getItem(cacheKey)
            
            if (cachedData) {
                const equipoCache = JSON.parse(cachedData)
                Object.assign(formData, {
                    especialidad: equipoCache.especialidad,
                    cantidadTrabajadores: equipoCache.cantidadTrabajadores || 0
                })
                localStorage.removeItem(cacheKey)
                return
            }
        }

        // Usar el composable para obtener el token
        const { getAuthHeaders, hasToken } = useAuthToken()

        if (!hasToken()) {
            await navigateTo('/')
            return
        }

        // Usar el mismo endpoint que en gestionEquipos.vue
        const response = await $fetch('http://localhost:4000/team/workers/count', {
            headers: getAuthHeaders()
        })
        
        let todosLosEquipos = []
        
        if (response && response['Equipos con cantidad de trabajadores']) {
            todosLosEquipos = response['Equipos con cantidad de trabajadores']
        } else if (Array.isArray(response)) {
            todosLosEquipos = response
        }
        
        const equipoEncontrado = todosLosEquipos.find(e => {
            const idEquipo = e.idEquipo || e.idTeam || e.id
            return idEquipo === equipoId.value
        })
        
        if (equipoEncontrado) {
            Object.assign(formData, {
                especialidad: equipoEncontrado.especialidad ?? '',
                cantidadTrabajadores: equipoEncontrado.cantidadTrabajadores ?? 0
            })
            
            if (process.client) {
                const cacheData = {
                    especialidad: equipoEncontrado.especialidad,
                    cantidadTrabajadores: equipoEncontrado.cantidadTrabajadores
                }
                localStorage.setItem(`equipo_cache_${equipoId.value}`, JSON.stringify(cacheData))
            }
        } else {
            mostrarToast('error', 'Error', 'No se encontraron datos del equipo')
        }
        
    } catch (error) {
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
            return
        }
        mostrarToast('error', 'Error', 'No se pudo cargar la información del equipo')
    }
}

onMounted(async () => {
    // Verificar si hay token antes de cargar datos
    const { hasToken } = useAuthToken()
    if (!hasToken()) {
        console.warn('⚠️ No hay token, redirigiendo al login...')
        await navigateTo('/')
        return
    }

    if (esEdicion.value && equipoId.value) {
        await cargarEquipo()
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

watch(equipoId, () => {
    guardarEnStorage()
})

const agregarEquipo = async () => {
    try {
        if (isEmptyString(formData.especialidad)) {
            mostrarToast('advertencia', 'Campo requerido', 'La especialidad es obligatoria')
            return
        }

        const body = {
            especialidad: formData.especialidad.trim()
        }

        const { getAuthHeaders, hasToken } = useAuthToken()

        if (!hasToken()) {
            await navigateTo('/')
            return
        }

        const response = await $fetch('http://localhost:4000/team', {
            method: 'POST',
            body,
            headers: getAuthHeaders()
        })

        mostrarToast('exito', 'Éxito', 'Equipo agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
    } catch (error) {
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
            return
        }
        mostrarToast('error', 'Error', 'Error al agregar equipo. Por favor, intente nuevamente.')
    }
}

const actualizarEquipo = async () => {
    try {
        if (isEmptyString(formData.especialidad)) {
            mostrarToast('advertencia', 'Campo requerido', 'La especialidad es obligatoria')
            return
        }

        const body = {
            especialidad: formData.especialidad.trim()
        }

        const { getAuthHeaders, hasToken } = useAuthToken()

        if (!hasToken()) {
            await navigateTo('/')
            return
        }

        const response = await $fetch(`http://localhost:4000/team/${equipoId.value}`, {
            method: 'PUT',
            body,
            headers: getAuthHeaders()
        })

        mostrarToast('exito', 'Éxito', 'Equipo actualizado correctamente')
        
        if (process.client) {
            localStorage.removeItem(`equipo_cache_${equipoId.value}`)
        }
        limpiarStorage()

        setTimeout(() => {
            navigateTo('/teams/gestionEquipos')
        }, 1500)
    } catch (error) {
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/')
            return
        }
        mostrarToast('error', 'Error', 'Error al actualizar equipo. Por favor, intente nuevamente.')
    }
}

const limpiarFormulario = () => {
    formData.especialidad = ''
    formData.cantidadTrabajadores = 0
}
</script>