<template>
  <section class="game-zone">
    <header class="zone-header">
      <span class="zone-title">{{ title }}</span>
      <span class="zone-score">{{ board.score }}/3 KO</span>
    </header>

    <div class="zone-body">
      <CardComponent
        v-if="activeCardAsCard && board.activeCard"
        :card="activeCardAsCard"
        :current-hp="board.activeCard.currentHp"
        disabled
        size="sm"
      />

      <NEmpty v-else description="Aucune carte en jeu" />
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CardComponent from '@/components/card/CardComponent.vue'
import type { Card, PlayerBoard } from '@/types'

interface GameZoneComponentProps {
  title: string
  board: PlayerBoard
}

const props = defineProps<GameZoneComponentProps>()

const activeCardAsCard = computed<Card | null>(() => {
  if (!props.board.activeCard) return null

  return {
    id: props.board.activeCard.id,
    name: props.board.activeCard.name,
    hp: props.board.activeCard.hp,
    attack: props.board.activeCard.attack,
    type: props.board.activeCard.type,
    pokedexNumber: props.board.activeCard.id,
    imgUrl: props.board.activeCard.imgUrl,
  }
})
</script>

<style scoped>
/* fuck le CSS */
.game-zone {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  width: 100%;
}

.zone-header {
  align-items: center;
  border-bottom: 1px solid #ececec;
  display: flex;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 14px;
}

.zone-title {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.zone-score {
  color: #6b7280;
  font-size: 12px;
}

.zone-body {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 300px;
  padding: 10px;
}
</style>
