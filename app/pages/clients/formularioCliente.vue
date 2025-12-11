<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-6xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                {{ esEdicion ? 'Editar Cliente' : 'Agregar Cliente' }}
            </h1>
            
            <form @submit.prevent="esEdicion ? actualizarCliente() : agregarCliente()" class="flex flex-col gap-6 w-full">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <!-- Columna izquierda -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Nombre:</label>
                            <InputGenerico
                                v-model="formData.nombre"
                                placeholder="Ingrese el nombre"
                                @keypress="soloLetras"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Apellido:</label>
                            <InputGenerico
                                v-model="formData.apellido"
                                placeholder="Ingrese el apellido"
                                @keypress="soloLetras"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Dirección:</label>
                            <InputGenerico
                                v-model="formData.direccion"
                                placeholder="Ingrese la dirección"
                            />
                        </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Teléfono:</label>
                            <InputGenerico
                                v-model="formData.telefono"
                                type="tel"
                                placeholder="Ingrese el teléfono"
                                @keypress="soloNumeros"
                            />
                        </div>

                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-petrona text-white text-base font-semibold">Correo:</label>
                            <InputGenerico
                                v-model="formData.correo"
                                type="email"
                                placeholder="Ingrese el correo electrónico"
                            />
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 justify-center mt-6 w-full">
                    <NuxtLink to="/clients/gestionClientes" class="flex-1" @click="limpiarStorage">
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
const clienteId = computed(() => route.query.edit)

// Reactive data
const formData = reactive({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    correo: ''
})

// Estado para la notificación
const mostrarNotificacion = ref(false)
const tipoNotificacion = ref('exito')
const tituloNotificacion = ref('')
const mensajeNotificacion = ref('')

// Claves para localStorage
const STORAGE_KEYS = {
    FORM_DATA: 'cliente_form_data',
    IS_EDITING: 'cliente_is_editing',
    CLIENTE_ID: 'cliente_id'
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
        if (clienteId.value) {
            localStorage.setItem(STORAGE_KEYS.CLIENTE_ID, clienteId.value)
        }
    }
}

// Cargar datos desde localStorage
const cargarDesdeStorage = () => {
    if (typeof window !== 'undefined') {
        const savedFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
        const savedIsEditing = localStorage.getItem(STORAGE_KEYS.IS_EDITING)
        const savedClienteId = localStorage.getItem(STORAGE_KEYS.CLIENTE_ID)
        
        if (savedFormData) {
            const parsedData = JSON.parse(savedFormData)
            Object.assign(formData, parsedData)
        }
        
        // Verificar si estamos en el mismo contexto de edición
        if (savedIsEditing && savedClienteId) {
            const isEditing = JSON.parse(savedIsEditing)
            if (isEditing && savedClienteId === clienteId.value) {
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
        localStorage.removeItem(STORAGE_KEYS.CLIENTE_ID)
    }
}

// Cargar datos del cliente si estamos en modo edición
onMounted(async () => {
    // Verificar si hay token antes de cargar datos
    const { hasToken } = useAuthToken()
    if (!hasToken()) {
        console.warn('⚠️ No hay token, redirigiendo al login...')
        await navigateTo('/login')
        return
    }

    if (esEdicion.value && clienteId.value) {
        await cargarCliente()
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

// Watch para guardar cuando cambie el ID del cliente
watch(clienteId, () => {
    guardarEnStorage()
})

// Función para cargar datos del cliente
const cargarCliente = async () => {
    try {
        // Primero verificar si hay datos en cache
        const cachedData = localStorage.getItem(`cliente_cache_${clienteId.value}`)
        if (cachedData) {
            const clienteCache = JSON.parse(cachedData)
            Object.assign(formData, {
                nombre: clienteCache.nombre,
                apellido: clienteCache.apellido,
                direccion: clienteCache.direccion,
                telefono: clienteCache.telefono,
                correo: clienteCache.correo
            })
            console.log('✅ Cliente cargado desde cache')
        }

        // Usar el composable para obtener el token
        const { getAuthHeaders, hasToken } = useAuthToken()

        // Siempre hacer la petición para tener datos actualizados
        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        const response = await $fetch(`http://localhost:4000/client/${clienteId.value}`, {
            headers: getAuthHeaders()
        })
        
        if (response && response['Cliente solicitado']) {
            const cliente = response['Cliente solicitado']
            
            // Actualizar el formulario con los datos del cliente
            Object.assign(formData, {
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                direccion: cliente.direccion,
                telefono: cliente.telefono,
                correo: cliente.correo
            })
            
            // Guardar en cache
            localStorage.setItem(`cliente_cache_${clienteId.value}`, JSON.stringify(cliente))
            
            console.log('✅ Cliente cargado correctamente:', formData)
        }
    } catch (error) {
        console.error('Error al cargar cliente:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'No se pudo cargar la información del cliente')
    }
}

// Método para agregar cliente
const agregarCliente = async () => {
    try {
        console.log('Datos del cliente:', formData)
        
        // Validar que todos los campos requeridos estén llenos
        if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.correo) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Usar el composable para obtener el token
        const { getAuthHeaders, hasToken } = useAuthToken()

        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        // Enviar datos al servidor usando $fetch
        const response = await $fetch('http://localhost:4000/client', {
            method: 'POST',
            body: {
                nombre: formData.nombre,
                apellido: formData.apellido,
                direccion: formData.direccion,
                telefono: formData.telefono,
                correo: formData.correo
            },
            headers: getAuthHeaders()
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Cliente agregado correctamente')
        limpiarFormulario()
        limpiarStorage()
        
    } catch (error) {
        console.error('Error al agregar cliente:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'Error al agregar cliente. Por favor, intente nuevamente.')
    }
}

// Método para actualizar cliente
const actualizarCliente = async () => {
    try {
        console.log('Actualizando cliente:', formData)
        
        // Validar que todos los campos requeridos estén llenos
        if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.correo) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
            return
        }

        // Usar el composable para obtener el token
        const { getAuthHeaders, hasToken } = useAuthToken()

        if (!hasToken()) {
            await navigateTo('/login')
            return
        }

        // Actualizar datos en el servidor usando $fetch
        const response = await $fetch(`http://localhost:4000/client/${clienteId.value}`, {
            method: 'PUT',
            body: {
                nombre: formData.nombre,
                apellido: formData.apellido,
                direccion: formData.direccion,
                telefono: formData.telefono,
                correo: formData.correo
            },
            headers: getAuthHeaders()
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Cliente actualizado correctamente')
        
        // Limpiar cache y storage
        localStorage.removeItem(`cliente_cache_${clienteId.value}`)
        limpiarStorage()
        
        // Navegar de vuelta a la gestión de clientes después de actualizar
        setTimeout(() => {
            navigateTo('/gestionClientes')
        }, 1500)
        
    } catch (error) {
        console.error('Error al actualizar cliente:', error)
        if (error?.status === 401 || error?.statusCode === 401) {
            await navigateTo('/login')
            return
        }
        mostrarToast('error', 'Error', 'Error al actualizar cliente. Por favor, intente nuevamente.')
    }
}

const soloNumeros = (event) => {
    const charCode = event.which ? event.which : event.keyCode
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
        event.preventDefault()
        return false
    }
    return true
}

const soloLetras = (event) => {
    const key = event.key
    // Permitir letras, espacios, ñ, acentos y teclas de control
    const letrasPermitidas = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/
    const teclasControl = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    
    if (!letrasPermitidas.test(key) && !teclasControl.includes(key)) {
        event.preventDefault()
        return false
    }
    return true
}

const limpiarFormulario = () => {
    formData.nombre = ''
    formData.apellido = ''
    formData.direccion = ''
    formData.telefono = ''
    formData.correo = ''
}
</script>