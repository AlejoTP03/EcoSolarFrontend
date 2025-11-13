<template>
    <div 
        class="p-6 rounded-lg shadow-lg text-center min-h-[140px] flex flex-col justify-center items-center transition-all duration-300 hover:shadow-xl"
        :style="{ backgroundColor: colorFondo }"
    >
        <h3 class="texto font-petrona text-lg font-semibold mb-2 text-gray-800">
        {{ texto }}
        </h3>
        <p class="numero font-petrona text-3xl font-bold text-gray-900">
        {{ numero }}
        </p>
    </div>
</template>

<script setup>
    defineProps({
    colorFondo: {
        type: String,
        default: '#ffffff'
    },
    texto: {
        type: String,
        default: ''
    },
    numero: {
        type: [Number, String],
        default: 0
    }
    })
</script>

<style scoped>
    /* Asegurar que se use Petrona como fuente */
    .texto, .numero {
    font-family: 'Petrona', serif;
    }                                                                                               
</style>