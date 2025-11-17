<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-hidden">
            <!-- Header -->
            <div class="bg-[#0B2241] p-6">
                <h3 class="text-xl font-bold text-white font-petrona">{{ titulo }}</h3>
            </div>
            
            <!-- Content -->
            <div class="p-6 max-h-64 overflow-y-auto">
                <div v-if="equipos.length === 0" class="text-center text-gray-500 py-8">
                    No hay equipos asignados a este proyecto
                </div>
                
                <div v-else class="space-y-3">
                    <div 
                        v-for="equipo in equipos" 
                        :key="equipo.idEquipo || equipo.idTeam"
                        class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span class="font-petrona text-gray-700 font-medium">
                            {{ equipo.especialidad || equipo.nombre || 'Equipo sin nombre' }}
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="border-t border-gray-200 p-4 bg-gray-50">
                <div class="flex justify-end">
                    <button 
                        @click="$emit('cerrar')"
                        class="px-6 py-2 bg-gray-600 text-white rounded-lg font-petrona font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: Boolean,
    equipos: {
        type: Array,
        default: () => []
    },
    titulo: {
        type: String,
        default: 'Equipos del proyecto'
    }
})

defineEmits(['cerrar'])
</script>