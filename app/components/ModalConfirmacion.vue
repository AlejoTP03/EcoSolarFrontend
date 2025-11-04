<template>
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <!-- Fondo transparente que no bloquea la interacción -->
        <div class="absolute inset-0 pointer-events-auto" @click="cancelar"></div>
        
        <!-- Modal como notificación flotante -->
        <div class="relative bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs mx-4 pointer-events-auto">
            <!-- Contenido compacto -->
            <div class="p-4">
                <div class="flex items-center gap-3 mb-3">
                    <div class="bg-red-50 p-1.5 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-sm font-medium text-gray-800 leading-tight">{{ titulo }}</h3>
                        <p class="text-gray-500 text-xs mt-1 leading-relaxed">{{ mensaje }}</p>
                    </div>
                </div>
                
                <!-- Botones inline -->
                <div class="flex justify-end gap-2 pt-2">
                    <button 
                        @click="cancelar"
                        class="px-3 py-1.5 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition-colors duration-100"
                    >
                        Cancelar
                    </button>
                    <button 
                        @click="confirmar"
                        class="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-100"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    titulo: {
        type: String,
        default: 'Eliminar'
    },
    mensaje: {
        type: String,
        default: '¿Estás seguro de eliminar este elemento?'
    }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirmar = () => {
    emit('confirm')
}

const cancelar = () => {
    emit('cancel')
}

// Cerrar modal con ESC
const handleEscape = (e) => {
    if (e.key === 'Escape') {
        cancelar()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>