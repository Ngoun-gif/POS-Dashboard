<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const currentPageName = computed(() => {
  const path = route.path

  if (path.includes('dashboard')) return 'Dashboard'
  if (path.includes('category')) return 'Category'
  if (path.includes('product')) return 'Product'
  if (path.includes('subject')) return "Subject"
  if (path.includes('teacher')) return "Teacher"
  if (path.includes('user')) return "User"

  return 'Dashboard'
})
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
    <!-- Left section (breadcrumb) -->
    <div class="flex items-center gap-2">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem class="hidden md:block">
            <BreadcrumbLink href="#" class="dark:text-gray-300">
              {{ currentPageName }}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- Right section (dark mode toggle) -->
    <div class="flex items-center gap-4">
      <DarkModeToggle />
    </div>
  </header>
</template>