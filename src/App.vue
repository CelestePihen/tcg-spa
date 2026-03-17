<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <HeaderBar v-if="isAuthenticated" />
        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/store/auth.store.ts'

import HeaderBar from './components/layout/HeaderBar.vue'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>

<style>
body {
  padding: 0 20px;
}
</style>
