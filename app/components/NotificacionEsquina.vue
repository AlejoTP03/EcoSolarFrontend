<template>
    <div 
        v-if="mostrar"
        class="fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-in-out"
        :class="{
            'transform translate-x-0 opacity-100': mostrar,
            'transform translate-x-full opacity-0': !mostrar
        }"
    >
        <div 
            class="rounded-lg shadow-lg p-4 border-l-4"
            :class="clasesNotificacion"
        >
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <component 
                        :is="icono" 
                        class="h-5 w-5" 
                        :class="clasesIcono"
                    />
                </div>
                <div class="ml-3 flex-1">
                    <p class="font-petrona font-semibold" :class="clasesTitulo">
                        {{ titulo }}
                    </p>
                    <p class="mt-1 text-sm" :class="clasesMensaje">
                        {{ mensaje }}
                    </p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button
                        @click="cerrar"
                        class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                        :class="clasesBotonCerrar"
                    >
                        <span class="sr-only">Cerrar</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Props del componente
const props = defineProps({
    mostrar: {
        type: Boolean,
        default: false
    },
    tipo: {
        type: String,
        default: 'exito', // 'exito', 'advertencia', 'error'
        validator: (value) => ['exito', 'advertencia', 'error'].includes(value)
    },
    titulo: {
        type: String,
        default: ''
    },
    mensaje: {
        type: String,
        default: ''
    },
    duracion: {
        type: Number,
        default: 5000 // Duración en milisegundos
    }
})

const emit = defineEmits(['cerrar'])

// Computed para las clases dinámicas
const clasesNotificacion = computed(() => {
    const clases = {
        exito: 'bg-green-50 border-green-400',
        advertencia: 'bg-yellow-50 border-yellow-400',
        error: 'bg-red-50 border-red-400'
    }
    return clases[props.tipo] || clases.exito
})

const clasesTitulo = computed(() => {
    const clases = {
        exito: 'text-green-800',
        advertencia: 'text-yellow-800',
        error: 'text-red-800'
    }
    return clases[props.tipo] || clases.exito
})

const clasesMensaje = computed(() => {
    const clases = {
        exito: 'text-green-700',
        advertencia: 'text-yellow-700',
        error: 'text-red-700'
    }
    return clases[props.tipo] || clases.exito
})

const clasesIcono = computed(() => {
    const clases = {
        exito: 'text-green-400',
        advertencia: 'text-yellow-400',
        error: 'text-red-400'
    }
    return clases[props.tipo] || clases.exito
})

const clasesBotonCerrar = computed(() => {
    const clases = {
        exito: 'text-green-400 hover:text-green-500 focus:ring-green-500',
        advertencia: 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500',
        error: 'text-red-400 hover:text-red-500 focus:ring-red-500'
    }
    return clases[props.tipo] || clases.exito
})

// Icono según el tipo
const icono = computed(() => {
    const iconos = {
        exito: CheckCircleIcon,
        advertencia: ExclamationTriangleIcon,
        error: XCircleIcon
    }
    return iconos[props.tipo] || CheckCircleIcon
})

// Iconos SVG
const CheckCircleIcon = {
    template: `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    `
}

const ExclamationTriangleIcon = {
    template: `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    `
}

const XCircleIcon = {
    template: `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    `
}

// Cerrar notificación automáticamente después de la duración
watch(() => props.mostrar, (nuevoValor) => {
    if (nuevoValor && props.duracion > 0) {
        setTimeout(() => {
            emit('cerrar')
        }, props.duracion)
    }
})

// Método para cerrar manualmente
const cerrar = () => {
    emit('cerrar')
}
</script>