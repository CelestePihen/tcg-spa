<template>
  <div class="container">
    <NEmpty description="Page d'accueil à implémenter (ticket 3)" />

    <NFlex justify="space-between">
      <h1>Mes decks</h1>
      <NFlex align="center">
        <NButton type="primary" @click="handleNewDeck">+ Nouveau deck</NButton>
      </NFlex>
    </NFlex>

    <ListDeckComponent />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import ListDeckComponent from '@/components/ListDeckComponent.vue'
import { ROUTES } from '@/router.ts'

const router = useRouter()

const handleNewDeck = async () => {
  await router.push(ROUTES.CREATE_DECK)
}
</script>
