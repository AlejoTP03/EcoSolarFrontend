<template>
    <div class="min-h-screen bg-gray-50 flex justify-center items-center p-5 w-full">
        <div class="bg-[#0B2241] p-10 rounded-xl shadow-2xl w-full max-w-6xl">
            <h1 class="font-petrona text-white text-center mb-8 text-3xl font-bold">
                Agregar Cliente
            </h1>
            
            <form @submit.prevent="agregarCliente" class="flex flex-col gap-6 w-full">
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
                    <NuxtLink to="/gestionClientes" class="flex-1">
                        <ButtonGenerico
                            texto="Cancelar"
                        />
                    </NuxtLink>
                    <button 
                        type="submit"
                        class="flex-1 px-6 py-3 bg-[#174785] text-white rounded-lg font-petrona font-semibold text-base cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Agregar
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

// Método para mostrar notificaciones
const mostrarToast = (tipo, titulo, mensaje, duracion = 5000) => {
    tipoNotificacion.value = tipo
    tituloNotificacion.value = titulo
    mensajeNotificacion.value = mensaje
    mostrarNotificacion.value = true
}

// Métodos
const agregarCliente = async () => {
    try {
        console.log('Datos del cliente:', formData)
        
        // Validar que todos los campos requeridos estén llenos
        if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.correo) {
            mostrarToast('advertencia', 'Campos requeridos', 'Por favor, complete todos los campos requeridos')
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
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Respuesta del servidor:', response)
        mostrarToast('exito', 'Éxito', 'Cliente agregado correctamente')
        limpiarFormulario()
        
    } catch (error) {
        console.error('Error al agregar cliente:', error)
        mostrarToast('error', 'Error', 'Error al agregar cliente. Por favor, intente nuevamente.')
    }
}

const limpiarFormulario = () => {
    formData.nombre = ''
    formData.apellido = ''
    formData.direccion = ''
    formData.telefono = ''
    formData.correo = ''
}
</script>