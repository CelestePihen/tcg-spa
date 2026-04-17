<template>
  <div class="player-hand">
    <p class="hand-title">Main ({{ visibleHand.length }}/5)</p>

    <div v-if="visibleHand.length === 0" class="empty-hand">
      <NEmpty description="Main vide" size="small" />
    </div>

    <div v-else class="hand-grid">
      <div v-for="card in visibleHand" :key="card.id">
        <CardComponent
          :card="toCardModel(card)"
          :disabled="!canPlayCard"
          @select-card="handlePlay(card.id)"
        />
      </div>
    </div>

    <p class="deck-count">Deck : {{ board.deckCount }} cartes</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CardComponent from '@/components/card/CardComponent.vue'
import type { Card, GameCard, PlayerBoard } from '@/types'

interface PlayerHandComponentProps {
  board: PlayerBoard
  isMyTurn: boolean
}

const props = defineProps<PlayerHandComponentProps>()

const emit = defineEmits<(e: 'play-card', cardId: number) => void>()

const canPlayCard = computed(
  () =>
    props.isMyTurn && !props.board.activeCard && props.board.hand.length > 0,
)

const visibleHand = computed(() => props.board.hand.slice(0, 5))

const handlePlay = (cardId: number): void => {
  if (!canPlayCard.value) return
  emit('play-card', cardId)
}

const toCardModel = (card: GameCard): Card => ({
  id: card.id,
  name: card.name,
  hp: card.hp,
  attack: card.attack,
  type: card.type,
  pokedexNumber: card.id,
  imgUrl: card.imgUrl,
})
</script>

<style scoped>
/* fuck le CSS */
.player-hand {
  border-top: 1px solid #ececec;
  padding: 10px;
}

.hand-title {
  color: #374151;
  font-size: 13px;
  margin: 0 0 8px;
}

.empty-hand {
  min-height: 100px;
}

.hand-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
}

.deck-count {
  color: #6b7280;
  font-size: 12px;
  margin: 8px 0 0;
}
</style>
