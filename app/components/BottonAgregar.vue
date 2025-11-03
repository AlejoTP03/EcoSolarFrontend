<!-- components/BotonAgregar.vue -->
<template>
    <button 
        class="px-4 py-2 rounded text-white font-medium transition-colors duration-200 hover:opacity-90 mr-4 flex items-center gap-2"
        :style="{
            backgroundColor: '#174785',
            color: '#FFFFFF'
        }"
        @click="$emit('click')"
    >
        <NuxtImg 
            src="/agregar.png" 
            alt="Icono agregar" 
            width="20" 
            height="20"
        />
        {{ buttonText }}
    </button>
</template>

<script setup>
// Props del componente
defineProps({
    buttonText: {
        type: String,
        default: 'Agregar'
    },
    iconSrc: {
        type: String,
        default: '/ruta/al/icono.png' // Ruta por defecto
    }
})

// Emitir evento click
defineEmits(['click'])
</script>