<template>
  <SidebarProvider>
    <div class="flex h-screen w-screen">
      <!-- Left sidebar -->
      <SidebarSection />

      <!-- Right side main area -->
      <div class="flex flex-1 flex-col">
        <!-- Top header -->
        <HeaderSection />

        <!-- Main content: page content goes here -->
        <main class="flex-1 overflow-auto p-4">
          <router-view />  <!-- This is where Dashboard / Category appears -->
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>

<script setup lang="ts">
import SidebarSection from './SidebarSection.vue'
import HeaderSection from './HeaderSection.vue'
import { SidebarProvider } from '@/components/ui/sidebar'
</script>
