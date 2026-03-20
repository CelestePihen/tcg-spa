<template>
  <NFlex align="center">
    <RouterLink :to="ROUTES.HOME"><NButton>← Retour</NButton></RouterLink>
    <h1>Détails du deck</h1>
  </NFlex>

  <DeckComponent :all-cards="cards" :deck="myDeck" :details="true" />
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DeckComponent from '@/components/DeckComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import { ROUTES } from '@/router.ts'
import type { Card, Deck } from '@/types'

const message = useMessage()
const api = useApi()
const route = useRoute()
const router = useRouter()

const cards = ref<Card[]>([])

const myDeck = ref<Deck>({
  cards: [],
  id: -1,
  name: "Missingno's Deck",
  userId: -1,
})

const fetchCards = async () => {
  try {
    cards.value = await api.getCards()
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
    await router.push(ROUTES.HOME)
  }
}

const fetchDeck = async () => {
  const deckId = route.params.deckId

  try {
    myDeck.value = await api.getDeck(Number(deckId))
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
    await router.push(ROUTES.HOME)
  }
}

onMounted(fetchCards)
onMounted(fetchDeck)
</script>

<style scoped></style>
