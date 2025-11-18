<!-- components/TablaGenericaConEstados.vue -->
<template>
    <div class="overflow-x-auto w-full max-w-none m-0">
        <table class="w-full bg-white border border-gray-200">
            <thead>
                <tr>
                    <!-- Columnas dinámicas -->
                    <th 
                        v-for="(column, index) in columns" 
                        :key="index"
                        class="py-3 px-4 text-left font-semibold border-b"
                        :style="{ backgroundColor: '#0B2241', color: '#FFFFFF' }"
                    >
                        {{ column }}
                    </th>
                    <!-- Columna adicional para acciones -->
                    <th 
                        class="py-3 px-4 text-left font-semibold border-b"
                        :style="{ backgroundColor: '#0B2241', color: '#FFFFFF' }"
                    >
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Filas de datos -->
                <tr 
                    v-for="(row, rowIndex) in data" 
                    :key="rowIndex" 
                    class="hover:bg-gray-50"
                >
                    <!-- Celdas de datos -->
                    <td 
                        v-for="(column, colIndex) in columns" 
                        :key="colIndex"
                        class="py-3 px-4 border-b text-gray-700"
                        :class="getCellClass(column, row[column])"
                    >
                        <!-- Renderizado especial para Estado -->
                        <span v-if="column === 'Estado' && isEstadoObject(row[column])" 
                              :class="row[column].clase">
                            {{ row[column].texto }}
                        </span>
                        <!-- Renderizado normal para otras columnas -->
                        <span v-else>
                            {{ getCellValue(column, row[column]) }}
                        </span>
                    </td>
                    <!-- Celda de acciones -->
                    <td class="py-3 px-4 border-b">
                        <div class="flex space-x-2">
                            <!-- Icono de editar -->
                            <button 
                                @click="$emit('edit', row)"
                                class="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                title="Editar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <!-- Icono de eliminar -->
                            <button 
                                @click="$emit('delete', row)"
                                class="text-red-600 hover:text-red-800 transition-colors duration-200"
                                title="Eliminar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
                <!-- Mensaje cuando no hay datos -->
                <tr v-if="data.length === 0">
                    <td 
                        :colspan="columns.length + 1" 
                        class="py-4 px-4 text-center text-gray-500"
                    >
                        No hay datos para mostrar
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
// Props del componente
defineProps({
    // Columnas de la tabla
    columns: {
        type: Array,
        default: () => ['Nombre', 'Apellidos', 'Dirección', 'Teléfono', 'Correo']
    },
    // Datos de la tabla
    data: {
        type: Array,
        default: () => []
    }
})

// Emitir eventos para editar y eliminar
defineEmits(['edit', 'delete'])

// Función para verificar si es un objeto de estado
const isEstadoObject = (value) => {
    return typeof value === 'object' && value !== null && 'texto' in value && 'clase' in value
}

// Función para obtener el valor de la celda
const getCellValue = (column, value) => {
    if (column === 'Estado' && isEstadoObject(value)) {
        return value.texto
    }
    return value
}

// Función para obtener clases adicionales de la celda
const getCellClass = (column, value) => {
    if (column === 'Estado' && isEstadoObject(value)) {
        return 'estado-cell'
    }
    return ''
}
</script>

<style scoped>
/* Estilos para los estados - SIN @apply */
.estado-pendiente {
    background-color: rgb(254 249 195);
    color: rgb(146 64 14);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    display: inline-block;
}

.estado-activo {
    background-color: rgb(220 252 231);
    color: rgb(22 101 52);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    display: inline-block;
}

.estado-finalizado {
    background-color: rgb(219 234 254);
    color: rgb(30 64 175);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    display: inline-block;
}

.estado-cancelado {
    background-color: rgb(254 226 226);
    color: rgb(153 27 27);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    display: inline-block;
}

.estado-default {
    background-color: rgb(243 244 246);
    color: rgb(55 65 81);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    display: inline-block;
}

/* Clase para la celda de estado */
.estado-cell {
    white-space: nowrap;
}
</style>