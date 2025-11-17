<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside class="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-300 flex flex-col">
        <!-- Logo -->
        <div class="w-full">
            <NuxtLink to="/">
                <NuxtImg 
                src="/EcoSolar.jpg" 
                alt="EcoSolar Logo" 
                class="w-full h-auto"
                />
            </NuxtLink>
            
        </div>
        
        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 space-y-2">
            <NuxtLink to="/" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-300">
            <NuxtImg src="/principal.png" alt="Principal" width="24" height="24" />
            <span class="font-medium" style="color: #0B2241;">Principal</span>
            </NuxtLink>
            
            <NuxtLink to="/clients/gestionClientes" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-300">
            <NuxtImg src="/cliente.png" alt="Clientes" width="24" height="24" />
            <span class="font-medium" style="color: #0B2241;">Clientes</span>
            </NuxtLink>
            
            <NuxtLink to="/teams/gestionEquipos" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-300">
            <NuxtImg src="/team.png" alt="Equipos" width="24" height="24" />
            <span class="font-medium" style="color: #0B2241;">Equipos</span>
            </NuxtLink>
            
            <NuxtLink to="/projects/gestionProyectos" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-300">
            <NuxtImg src="/proyecto.png" alt="Proyectos" width="24" height="24" />
            <span class="font-medium" style="color: #0B2241;">Proyectos</span>
            </NuxtLink>
            
            <NuxtLink to="/workers/gestionTrabajador" class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-300">
            <NuxtImg src="/trabajador.png" alt="Trabajadores" width="24" height="24" />
            <span class="font-medium" style="color: #0B2241;">Trabajadores</span>
            </NuxtLink>
        </nav>
    </aside>

        <!-- Main Content Area -->
        <div class="ml-64">
        

        <!-- Page Content -->
        <main>
            <slot />
        </main>
        </div>
    </div>
</template>

<style scoped>
.nav-link-text {
    color: #0B2241;
}
</style>

