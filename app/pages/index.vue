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
                    @click="fetchAllData" 
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
                    :numero="totalProyectos"
                />
                
                <!-- Total Equipos -->
                <CuadroPanel 
                    color-fondo="#6CAE75"
                    texto="Total Trabajadores" 
                    :numero="totalTrabajadores"
                />
            </div>
        </main>
    </div>
</template>

<script setup>
// Estados reactivos para cada métrica
const totalClientes = ref(0)
const totalProyectos = ref(0)
const totalTrabajadores = ref(0)
const pending = ref(false)
const error = ref(null)

// Claves para localStorage
const STORAGE_KEYS = {
  clientes: 'dashboard_total_clientes',
  proyectos: 'dashboard_total_proyectos',
  trabajadores: 'dashboard_total_trabajadores'
}

// URLs de las APIs
const API_ENDPOINTS = {
  clientes: 'http://localhost:4000/client/count/total',
  proyectos: 'http://localhost:4000/proyect/count/total',
  trabajadores: 'http://localhost:4000/worker/count/total'
}

// Función para guardar en localStorage
const saveToLocalStorage = (key, data) => {
    if (typeof window !== 'undefined') {
        try {
            const storageData = {
                value: data,
                timestamp: new Date().getTime()
            }
            localStorage.setItem(key, JSON.stringify(storageData))
            console.log(`Datos guardados en localStorage (${key}):`, data)
        } catch (e) {
            console.error(`Error guardando en localStorage (${key}):`, e)
        }
    }
}

// Función para cargar desde localStorage
const loadFromLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem(key)
            console.log(`Datos recuperados de localStorage (${key}):`, stored)
            
            if (stored) {
                const parsedData = JSON.parse(stored)
                return parsedData.value
            }
        } catch (e) {
            console.error(`Error leyendo localStorage (${key}):`, e)
        }
    }
    return null
}

// Función para obtener datos de una API específica
const fetchData = async (endpoint, storageKey, refValue) => {
    try {
        console.log(`Haciendo petición a la API: ${endpoint}`)
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} para ${endpoint}`)
        }
        
        const data = await response.json()
        console.log(`Respuesta de la API (${endpoint}):`, data)
        
        // Asignar el valor desde la respuesta de la API
        // Asumiendo que todas las APIs devuelven un objeto con una propiedad que contiene el total
        let value = 0
        
        // Manejar diferentes estructuras de respuesta
        if (data && typeof data === 'object') {
            // Buscar cualquier propiedad que contenga "total" en su nombre
            const totalKey = Object.keys(data).find(key => 
                key.toLowerCase().includes('total')
            )
            value = totalKey ? data[totalKey] : 0
        } else if (typeof data === 'number') {
            value = data
        }
        
        refValue.value = value
        saveToLocalStorage(storageKey, value)
        console.log(`${storageKey} actualizado:`, value)
        
        return { success: true }
    } catch (err) {
        console.error(`Error fetching data from ${endpoint}:`, err)
        return { success: false, error: err }
    }
}

// Función para obtener todos los datos
const fetchAllData = async () => {
    pending.value = true
    error.value = null
    
    try {
        // Hacer todas las peticiones en paralelo
        const results = await Promise.allSettled([
            fetchData(API_ENDPOINTS.clientes, STORAGE_KEYS.clientes, totalClientes),
            fetchData(API_ENDPOINTS.proyectos, STORAGE_KEYS.proyectos, totalProyectos),
            fetchData(API_ENDPOINTS.trabajadores, STORAGE_KEYS.trabajadores, totalTrabajadores)
        ])
        
        // Verificar si hubo errores
        const errors = results
            .filter(result => result.status === 'rejected' || 
                            (result.status === 'fulfilled' && !result.value.success))
            .map(result => result.reason || result.value.error)
        
        if (errors.length > 0) {
            console.warn('Algunas peticiones fallaron:', errors)
            
            // Si todas las peticiones fallaron, establecer un error general
            if (errors.length === results.length) {
                throw new Error('No se pudieron cargar los datos de ninguna fuente')
            }
        }
        
    } catch (err) {
        error.value = err
        console.error('Error general fetching data:', err)
    } finally {
        pending.value = false
    }
}

// Cargar datos al montar el componente
onMounted(() => {
    console.log('Componente montado, cargando datos...')
    
    // Primero intentar cargar desde localStorage
    const storedClientes = loadFromLocalStorage(STORAGE_KEYS.clientes)
    const storedProyectos = loadFromLocalStorage(STORAGE_KEYS.proyectos)
    const storedTrabajadores = loadFromLocalStorage(STORAGE_KEYS.trabajadores)
    
    if (storedClientes !== null) totalClientes.value = storedClientes
    if (storedProyectos !== null) totalProyectos.value = storedProyectos
    if (storedTrabajadores !== null) totalTrabajadores.value = storedTrabajadores
    
    console.log('Datos cargados desde localStorage:', {
        clientes: totalClientes.value,
        proyectos: totalProyectos.value,
        trabajadores: totalTrabajadores.value
    })
    
    // Luego hacer las peticiones a las APIs para actualizar
    fetchAllData()
})

</script>