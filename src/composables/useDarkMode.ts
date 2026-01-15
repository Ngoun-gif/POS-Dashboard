// src/composables/useDarkMode.ts
import { ref, onMounted, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // Initialize from localStorage or system preference
  onMounted(() => {
    // Corrected localStorage check (was checking for 'false' before)
    const savedMode = localStorage.getItem('darkMode')
    
    if (savedMode !== null) {
      // Use saved preference if exists
      isDark.value = savedMode === 'true'
    } else {
      // Fallback to system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    applyDarkMode()
  })

  // Watch for changes
  watch(isDark, () => {
    applyDarkMode()
    localStorage.setItem('darkMode', isDark.value.toString())
  })

  // Apply class to HTML element
  function applyDarkMode() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}