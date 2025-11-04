<template>
    <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input-generico"
    />
</template>

<script setup>
defineProps({
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-generico {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-family: 'Petrona', serif;
    font-size: 16px;
    background-color: white;
    color: #0B2241;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.input-generico:focus {
    outline: none;
    border-color: #174785;
    box-shadow: 0 0 0 3px rgba(23, 71, 133, 0.1);
}

.input-generico::placeholder {
    color: #94a3b8;
}
</style>