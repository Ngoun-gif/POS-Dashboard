<script lang="ts">
export const description = "A two column login page with a cover image.";
</script>

<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next";
import LoginForm from "@/modules/auth/components/LoginForm.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const onSuccess = () => router.push("/dashboard");
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-between items-center">
        <div class="flex justify-center gap-2 md:justify-start">
          <div class="flex items-center gap-2 font-medium text-foreground">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd class="h-4 w-4" />
            </div>
            CA Solution Cambodia
          </div>
        </div>
        <DarkModeToggle />
      </div>

      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <LoginForm @success="onSuccess" />
        </div>
      </div>
    </div>

    <div class="relative hidden bg-muted lg:block">
      <img
          src="/vue.svg"
          alt="Image"
          class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
