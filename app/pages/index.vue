<template>
    <div>
        <!-- Header -->
        <header class="bg-[#174785] text-white px-8 py-4 flex items-center justify-between fixed top-0 right-0 left-64 z-10">
            <h1 class="text-2xl font-semibold">Dashboard</h1>
        </header>

        <!-- Main Content -->
        <main class="mt-16 p-8">
            <!-- Estados de carga y error -->
            <div v-if="pending" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-2 text-gray-600">Cargando datos...</p>
            </div>

            <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>Error al cargar los datos: {{ error.message }}</p>
                <button 
                    @click="fetchTotalClientes" 
                    class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>

            <!-- Grid de Paneles -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-auto justify-center">
                <!-- Total Clientes -->
                <CuadroPanel 
                    color-fondo="#FFFFFF"
                    texto="Total Clientes" 
                    :numero="totalClientes"
                />
                
                <!-- Total Proyectos -->
                <CuadroPanel 
                    color-fondo="#8B9474"
                    texto="Total Proyectos" 
                    :numero="12"
                />
                
                <!-- Total Equipos -->
                <CuadroPanel 
                    color-fondo="#6CAE75"
                    texto="Total Equipos" 
                    :numero="8"
                />
            </div>
        </main>
    </div>
</template>

<script setup>
// Estados reactivos
const totalClientes = ref(0)
const pending = ref(false)
const error = ref(null)

// Clave para localStorage
const STORAGE_KEY = 'dashboard_total_clientes'

// Función para guardar en localStorage
const saveToLocalStorage = (data) => {
    if (typeof window !== 'undefined') {
        try {
            const storageData = {
                value: data,
                timestamp: new Date().getTime()
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
            console.log('Datos guardados en localStorage:', data)
        } catch (e) {
            console.error('Error guardando en localStorage:', e)
        }
    }
}

// Función para cargar desde localStorage
const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            console.log('Datos recuperados de localStorage:', stored)
            
            if (stored) {
                const parsedData = JSON.parse(stored)
                return parsedData.value
            }
        } catch (e) {
            console.error('Error leyendo localStorage:', e)
        }
    }
    return null
}

// Función para obtener el total de clientes desde la API
const fetchTotalClientes = async () => {
    pending.value = true
    error.value = null
    
    try {
        console.log('Haciendo petición a la API...')
        const response = await fetch('http://localhost:4000/client/count/total', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Respuesta de la API:', data)
        
        // Asignar el total de clientes desde la respuesta de la API
        if (data && data.totalClientes !== undefined) {
            totalClientes.value = data.totalClientes
            saveToLocalStorage(totalClientes.value)
            console.log('Total clientes actualizado:', totalClientes.value)
        } else {
            totalClientes.value = 0
            saveToLocalStorage(0)
        }
        
    } catch (err) {
        error.value = err
        console.error('Error fetching total clients:', err)
        
        // En caso de error, intentar cargar datos del localStorage
        const storedValue = loadFromLocalStorage()
        if (storedValue !== null) {
            totalClientes.value = storedValue
            console.log('Usando datos de localStorage:', storedValue)
            error.value = null // Limpiar error si tenemos datos guardados
        }
    } finally {
        pending.value = false
    }
}

// Cargar datos al montar el componente
onMounted(() => {
    console.log('Componente montado, cargando datos...')
    
    // Primero intentar cargar desde localStorage
    const storedValue = loadFromLocalStorage()
    if (storedValue !== null) {
        totalClientes.value = storedValue
        console.log('Datos cargados desde localStorage:', storedValue)
    } else {
        console.log('No hay datos en localStorage')
    }
    
    // Luego hacer la petición a la API para actualizar
    fetchTotalClientes()
})

// También puedes agregar un watcher para debuggear
watch(totalClientes, (newVal) => {
    console.log('totalClientes cambió a:', newVal)
})
</script>