<template>
  <NGrid :x-gap="2" :y-gap="10" :cols="nbColumn">
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
import CardComponent from '@/components/card/CardComponent.vue'
import type { Card } from '@/types'

interface ListCardProps {
  cards: Card[]
  selectedCardIds?: Set<number>
  selectionMode?: boolean
  nbColumn?: number
}

const props = withDefaults(defineProps<ListCardProps>(), {
  selectedCardIds: () => new Set<number>(),
  selectionMode: true,
  nbColumn: 6,
})

const emit =
  defineEmits<(e: 'update-selected-cards', ids: Set<number>) => void>()

const onSelectCard = (card: Card, selected: boolean) => {
  if (!props.selectionMode) return

  const selectedCardIds = new Set<number>(props.selectedCardIds)

  if (!selected) {
    selectedCardIds.add(card.id)
  } else if (selected) {
    selectedCardIds.delete(card.id)
  }

  emit('update-selected-cards', selectedCardIds)
}

const isCardSelected = (cardId: number) =>
  props.selectedCardIds.has(cardId) && props.selectionMode
const isCardDisabled = (cardId: number) =>
  !props.selectedCardIds.has(cardId) && props.selectedCardIds.size === 10
</script>

<style scoped></style>
