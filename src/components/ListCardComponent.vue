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
import CardComponent from '@/components/CardComponent.vue'
import type { Card } from '@/types'

interface ListCardProps {
  cards: Card[]
  selectedCardIds?: Set<number>
  canBeSelected?: boolean
  nbColumn?: number
}

const props = withDefaults(defineProps<ListCardProps>(), {
  selectedCardIds: () => new Set<number>(),
  canBeSelected: true,
  nbColumn: 6,
})

const emit =
  defineEmits<(e: 'update-selected-cards', ids: Set<number>) => void>()

const onSelectCard = (card: Card, selected: boolean) => {
  if (!props.canBeSelected) return

  if (!selected) {
    props.selectedCardIds.add(card.id)
  } else if (selected) {
    props.selectedCardIds.delete(card.id)
  }

  emit('update-selected-cards', new Set(props.selectedCardIds))
}

const isCardSelected = (cardId: number) =>
  props.selectedCardIds.has(cardId) && props.canBeSelected
const isCardDisabled = (cardId: number) =>
  !props.selectedCardIds.has(cardId) && props.selectedCardIds.size === 10
</script>

<style scoped></style>
