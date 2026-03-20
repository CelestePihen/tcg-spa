<template>
  <NGrid :x-gap="20" :y-gap="10" :cols="6">
    <NGi v-for="card in cards" :key="card.id">
      <CardComponent
        class="card"
        :card="card"
        :selected="isCardSelected(card.id)"
        :disabled="isCardDisabled(card.id)"
        @select-card="onSelectCard"
      ></CardComponent>
    </NGi>
  </NGrid>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'

import CardComponent from '@/components/CardComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import type { Card } from '@/types'

const api = useApi()
const message = useMessage()

const cards = ref<Card[]>([])
const selectedCardIds = ref<Set<number>>(new Set())

const fetchCards = async () => {
  try {
    cards.value = await api.getCards()
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
  }
}

const emit =
  defineEmits<(e: 'update-selected-cards', ids: Set<number>) => void>()

const onSelectCard = (card: Card, selected: boolean) => {
  if (!selected) {
    selectedCardIds.value.add(card.id)
  } else {
    selectedCardIds.value.delete(card.id)
  }

  emit('update-selected-cards', new Set(selectedCardIds.value))
}

const isCardSelected = (cardId: number) => selectedCardIds.value.has(cardId)
const isCardDisabled = (cardId: number) =>
  !selectedCardIds.value.has(cardId) && selectedCardIds.value.size === 10

onMounted(fetchCards)
</script>

<style scoped></style>
