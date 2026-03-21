<template>
  <NCard>
    <h2>{{ deck.name }}</h2>
    <ListCardComponent
      :cards="cards"
      :selection-mode="false"
      :nb-column="5"
    ></ListCardComponent>

    <NFlex style="margin-top: 20px" justify="end">
      <RouterLink v-if="!details" :to="`/details-deck/${deck.id}`">
        <NButton :disabled="isLoading">Détails</NButton>
      </RouterLink>
      <RouterLink :to="`/update-deck/${deck.id}`">
        <NButton :disabled="isLoading">Modifier</NButton>
      </RouterLink>
      <NButton
        v-if="!details"
        type="error"
        :disabled="isLoading"
        @click="showModal = true"
        >Supprimer</NButton
      >
    </NFlex>

    <NModal
      v-if="!details"
      v-model:show="showModal"
      preset="dialog"
      type="error"
      title="Supprimer le deck"
      content="Êtes-vous sûr(e) de supprimer ce deck ?"
      positive-text="Oui"
      negative-text="Non"
      @positive-click="handleDeleteDeck"
    />
  </NCard>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'

import ListCardComponent from '@/components/card/ListCardComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import type { Card, Deck } from '@/types'

interface DeckComponentProps {
  allCards: Card[]
  deck: Deck
  details?: boolean
}

const props = withDefaults(defineProps<DeckComponentProps>(), {
  details: false,
})

const emit = defineEmits<(e: 'deck-deleted', deckId: number) => void>()

const message = useMessage()
const api = useApi()

const showModal = ref<boolean>(false)
const isLoading = ref<boolean>(false)

const cards = computed(() => {
  const result: Card[] = []

  for (const deckCard of props.deck.cards) {
    const card = props.allCards.find((c) => c.id === deckCard.cardId)
    if (card) result.push(card)
  }

  return result
})

const handleDeleteDeck = async () => {
  try {
    isLoading.value = true
    await api.deleteDeck(props.deck.id)
    emit('deck-deleted', props.deck.id)
    message.success('Deck supprimé avec succès')
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>
