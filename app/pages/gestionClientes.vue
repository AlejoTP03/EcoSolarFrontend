<!-- pages/clientes.vue -->
<template>
    <div class="font-petrona w-full">
    <div class="font-petrona w-full">
        <div class="bg-[#0B2241] p-6 w-full h-[20vh] mb-0 flex flex-col">
            <h2 class="text-4xl font-bold text-[#FFFFFF] mb-6">Gestión de Clientes</h2>
            
            <!-- Botón Agregar -->
            <div class="ml-auto">
                <BottonAgregar 
                    :button-text="'Agregar Cliente'"
                    @click="agregarCliente"
                />
            </div>
        </div>
    </div>


        <!-- Contenido de la tabla -->
        <div class="w-full max-w-none m-0 p-0">
            <TablaGenerica 
                :columns="columnas"
                :data="clientes"
                @edit="editarCliente"
                @delete="eliminarCliente"
            />
        </div>
    </div>
</template>

<script setup>
    // Datos de ejemplo
    const columnas = ['Nombre', 'Apellidos', 'Dirección', 'Teléfono', 'Correo']

    const clientes = ref([
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'María',
        Apellidos: 'González',
        Dirección: 'Avenida 456, Pueblo',
        Teléfono: '098-765-4321',
        Correo: 'maria@example.com'
    },
    {
        Nombre: 'María',
        Apellidos: 'González',
        Dirección: 'Avenida 456, Pueblo',
        Teléfono: '098-765-4321',
        Correo: 'maria@example.com'
    },
    {
        Nombre: 'María',
        Apellidos: 'González',
        Dirección: 'Avenida 456, Pueblo',
        Teléfono: '098-765-4321',
        Correo: 'maria@example.com'
    },
    {
        Nombre: 'María',
        Apellidos: 'González',
        Dirección: 'Avenida 456, Pueblo',
        Teléfono: '098-765-4321',
        Correo: 'maria@example.com'
    },
    {
        Nombre: 'María',
        Apellidos: 'González',
        Dirección: 'Avenida 456, Pueblo',
        Teléfono: '098-765-4321',
        Correo: 'maria@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
    {
        Nombre: 'Juan',
        Apellidos: 'Pérez',
        Dirección: 'Calle 123, Ciudad',
        Teléfono: '123-456-7890',
        Correo: 'juan@example.com'
    },
])

// Métodos para manejar eventos
    const agregarCliente = () => {
        console.log('Agregar nuevo cliente')
        // Lógica para agregar cliente
    }

    const editarCliente = (cliente) => {
        console.log('Editar cliente:', cliente)
        // Lógica para editar
    }

    const eliminarCliente = (cliente) => {
        console.log('Eliminar cliente:', cliente)
        // Lógica para eliminar
    }
</script>