<script setup lang="ts">
import { cn } from '@/lib/utils.ts'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth.store.ts'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleSubmit(event: Event) {
  event.preventDefault()
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password'
    return
  }

  try {
    await auth.login(email.value, password.value)
    // Option 1: let parent handle redirect
    emit('success')

    // Option 2: redirect here (if you prefer)
    // router.push('/dashboard')
  } catch (err: any) {
    if (err?.response?.status === 401) {
      errorMessage.value = 'Invalid email or password'
    } else {
      errorMessage.value = err?.response?.data?.message || 'Something went wrong. Please try again.'
    }
  }
}
</script>

<template>
  <form :class="cn('flex flex-col gap-6', props.class)" @submit="handleSubmit">
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold text-foreground">Login to your account</h1>
      <p class="text-balance text-sm text-muted-foreground">
        Enter your credentials below to login
      </p>
    </div>

    <div v-if="errorMessage" class="text-sm text-destructive text-center p-2 bg-destructive/10 rounded-md">
      {{ errorMessage }}
    </div>

    <div class="grid gap-6">
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            :disabled="auth.loading"
            class="dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-500"
        />
      </div>

      <div class="grid gap-2">
        <div class="flex items-center">
          <Label for="password">Password</Label>
          <a href="#" class="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground">
            Forgot your password?
          </a>
        </div>

        <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="auth.loading"
            class="dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-gray-500"
        />
      </div>

      <Button type="submit" class="w-full" :disabled="auth.loading">
        <span v-if="auth.loading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
        <span v-else>Login</span>
      </Button>

      <!-- keep your other buttons as-is -->
    </div>

    <div class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <router-link
          to="/register"
          class="font-medium underline underline-offset-4 text-primary hover:text-primary/80"
      >
        Sign up
      </router-link>
    </div>
  </form>
</template>
