<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { List, Box, LayoutGrid, ShoppingCart, DollarSign } from 'lucide-vue-next'

import { ref, onMounted } from 'vue'

// Reactive data
const categoriesCount = ref(0)
const productsCount = ref(0)
const teachersCount = ref(0)
const subjectsCount = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)


</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      <p class="text-muted-foreground dark:text-gray-400 mt-1">
        Welcome back! Here's your overview!
      </p>
    </div>

    <!-- Top Metrics Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Categories Card -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Categories
          </CardTitle>
          <LayoutGrid class="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="h-8 flex items-center">
            <div class="animate-pulse h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div v-else>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ categoriesCount }}
            </p>
            <p class="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Products Card -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Sub-Categories
          </CardTitle>
          <Box class="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="h-8 flex items-center">
            <div class="animate-pulse h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div v-else>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ productsCount }}
            </p>
            <p class="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Teacher Card -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Products
          </CardTitle>
          <ShoppingCart class="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="h-8 flex items-center">
            <div class="animate-pulse h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div v-else>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ teachersCount }}
            </p>
            <p class="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Subject Card -->
      <Card class="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
        <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle class="text-sm font-medium text-gray-600 dark:text-gray-300">
            Product-Variant
          </CardTitle>
          <DollarSign class="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="h-8 flex items-center">
            <div class="animate-pulse h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div v-else>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ subjectsCount }}
            </p>
            <p class="text-xs text-muted-foreground dark:text-gray-400 mt-1">
             
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg">
      {{ error }}
    </div>

    <!-- Recent Activity -->
    <Card class="mt-6 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700">
      <CardHeader>
        <CardTitle class="text-gray-900 dark:text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent class="min-h-[420px]">
        <div class="space-y-4">
          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <List class="h-4 w-4 text-gray-500 dark:text-gray-300" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">No recent activity</p>
              <p class="text-sm text-muted-foreground dark:text-gray-400">Your activities will appear here</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>