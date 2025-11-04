<template>
    <button
        @click="$emit('click')"
        class="px-6 py-3 bg-[#174785] text-white rounded-lg font-petrona font-semibold text-base cursor-pointer transition-all duration-300 ease-in-out min-w-[120px] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
    >
        {{ texto }}
    </button>
</template>

<script setup>
defineProps({
    texto: {
        type: String,
        required: true
    }
})

defineEmits(['click'])
</script>