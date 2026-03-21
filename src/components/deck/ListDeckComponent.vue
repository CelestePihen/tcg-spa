<template>
  <NFlex justify="space-between">
    <h1>Mes decks</h1>
    <NFlex align="center">
      <NButton type="primary" @click="handleNewDeck">+ Nouveau deck</NButton>
    </NFlex>
  </NFlex>

  <DeckComponent
    v-for="deck in myDecks"
    :key="deck.id"
    :all-cards="allCards"
    :deck="deck"
    @deck-deleted="handleDeckDeleted"
  ></DeckComponent>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import DeckComponent from '@/components/deck/DeckComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import { ROUTES } from '@/router.ts'
import type { Card, Deck } from '@/types'

const message = useMessage()
const api = useApi()
const router = useRouter()

const allCards = ref<Card[]>([])
const myDecks = ref<Deck[]>([])

const getAllCards = async () => {
  try {
    allCards.value = await api.getCards()
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
  }
}

const getMyDecks = async () => {
  try {
    myDecks.value = await api.getMyDecks()
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
  }
}

const handleDeckDeleted = (deckId: number) => {
  myDecks.value = myDecks.value.filter((d) => d.id !== deckId)
}

const handleNewDeck = async () => {
  await router.push(ROUTES.CREATE_DECK)
}

onMounted(getAllCards)
onMounted(getMyDecks)
</script>

<style scoped></style>
