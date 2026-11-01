<template>
  <NLayoutHeader bordered class="header-bar">
    <div class="header-row">
      <NSpace align="center" :size="16" class="header-left">
        <RouterLink to="/">TCG SPA</RouterLink>
        <NButton
          tag="a"
          :href="`${apiBaseUrl.replace('/api', '')}/api-docs`"
          target="_blank"
          text
          size="small"
        >
          API Docs
        </NButton>
        <NButton
          tag="a"
          href="https://making-rerun-61323218.figma.site/"
          target="_blank"
          text
          size="small"
        >
          Maquettes
        </NButton>
      </NSpace>
      <NSpace align="center" :size="16" class="header-right">
        <NText depth="3">{{ user?.username ?? '' }}</NText>
        <NButton size="small" @click="handleSignOut">Déconnexion</NButton>
      </NSpace>
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/store/auth.store.ts'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { signOut } = authStore

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
/* fuck le CSS */
.header-bar {
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-row {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  min-height: 40px;
}

.header-left,
.header-right {
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .header-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-right {
    width: 100%;
  }
}
</style>
