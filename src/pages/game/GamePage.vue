<template>
  <NFlex vertical :size="12" class="game-page">
    <section class="game-panel">
      <GameZoneComponent :board="opponentBoard" title="Adversaire" />

      <ActionBarComponent
        :is-my-turn="isMyTurn"
        :can-draw="canDraw"
        :can-attack="canAttack"
        :can-end-turn="canEndTurn"
        :realtime-message="realtimeMessage"
        @draw="drawCards"
        @attack="attack"
        @end-turn="endTurn"
      />

      <GameZoneComponent :board="myBoard" title="Vous">
        <PlayerHandComponent
          :board="myBoard"
          :is-my-turn="isMyTurn"
          @play-card="playCard"
        />
      </GameZoneComponent>
    </section>

    <GameEndModalComponent
      :show="!!gameResult"
      :result="gameResult"
      @back-to-lobby="handleBackToLobby"
    />
  </NFlex>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

import ActionBarComponent from '@/components/game/ActionBarComponent.vue'
import GameEndModalComponent from '@/components/game/GameEndModalComponent.vue'
import GameZoneComponent from '@/components/game/GameZoneComponent.vue'
import PlayerHandComponent from '@/components/game/PlayerHandComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import router, { ROUTES } from '@/router.ts'
import type { Card, GameCard, GameResult, PlayerBoard } from '@/types'

const message = useMessage()
const api = useApi()

const FALLBACK_CARDS: Card[] = [
  {
    id: 1,
    name: 'Pikachu',
    type: 'Electric',
    hp: 60,
    attack: 25,
    pokedexNumber: 25,
    imgUrl: '',
  },
  {
    id: 2,
    name: 'Bulbasaur',
    type: 'Grass',
    hp: 70,
    attack: 20,
    pokedexNumber: 1,
    imgUrl: '',
  },
  {
    id: 3,
    name: 'Charmander',
    type: 'Fire',
    hp: 65,
    attack: 22,
    pokedexNumber: 4,
    imgUrl: '',
  },
  {
    id: 4,
    name: 'Squirtle',
    type: 'Water',
    hp: 72,
    attack: 18,
    pokedexNumber: 7,
    imgUrl: '',
  },
  {
    id: 5,
    name: 'Eevee',
    type: 'Normal',
    hp: 65,
    attack: 19,
    pokedexNumber: 133,
    imgUrl: '',
  },
  {
    id: 6,
    name: 'Psyduck',
    type: 'Water',
    hp: 68,
    attack: 17,
    pokedexNumber: 54,
    imgUrl: '',
  },
]

const toGameCard = (card: Card): GameCard => ({
  ...card,
  currentHp: card.hp,
})

const myBoard = ref<PlayerBoard>({
  id: '0',
  username: 'Vous',
  role: 'host',
  score: 0,
  activeCard: null,
  hand: [],
  deckCount: 6,
})

const opponentBoard = ref<PlayerBoard>({
  id: '1',
  username: 'Adversaire',
  role: 'guest',
  score: 0,
  activeCard: null,
  hand: [],
  deckCount: 6,
})

const isMyTurn = ref<boolean>(true)
const realtimeMessage = ref<string>('Votre tour')
const gameResult = ref<GameResult | null>(null)

const canDraw = computed(() => isMyTurn.value && myBoard.value.hand.length < 5)

const canAttack = computed(
  () =>
    isMyTurn.value &&
    !!myBoard.value.activeCard &&
    !!opponentBoard.value.activeCard,
)

const canEndTurn = computed(() => isMyTurn.value)

const hydrateBoards = (cards: Card[]): void => {
  const source = cards.length >= 6 ? cards : FALLBACK_CARDS
  const gameCards = source.slice(0, 6).map(toGameCard)

  myBoard.value.activeCard = gameCards[0] ?? null
  myBoard.value.hand = gameCards.slice(1, 5)
  myBoard.value.deckCount = Math.max(0, source.length - 5)

  opponentBoard.value.activeCard = gameCards[5] ?? gameCards[0] ?? null
  opponentBoard.value.hand = []
  opponentBoard.value.deckCount = Math.max(0, source.length - 1)
}

const initGameState = async (): Promise<void> => {
  myBoard.value.score = 0
  opponentBoard.value.score = 0
  gameResult.value = null
  isMyTurn.value = true
  realtimeMessage.value = 'Votre tour'

  try {
    const cards = await api.getCards()
    hydrateBoards(cards)
  } catch {
    hydrateBoards(FALLBACK_CARDS)
  }
}

const drawCards = (): void => {
  message.info('Action Piocher prête. Mettre store quand prêt.')
}

const playCard = (cardId: number): void => {
  const selectedCard = myBoard.value.hand.find((card) => card.id === cardId)
  if (!selectedCard) return

  message.info(
    `Action Jouer (${selectedCard.name}) prête. Mettre store quand prêt.`,
  )
}

const attack = (): void => {
  message.info('Action Attaquer prête. Mettre store quand prêt.')
}

const endTurn = (): void => {
  if (!canEndTurn.value) return
  isMyTurn.value = false
  realtimeMessage.value = 'Tour adverse (mock).'

  setTimeout(() => {
    isMyTurn.value = true
    realtimeMessage.value = 'Votre tour'
  }, 800)
}

const handleBackToLobby = async (): Promise<void> => {
  await initGameState()
  await router.push(ROUTES.HOME)
}

onMounted(() => {
  initGameState()
})
</script>

<style scoped>
/* fuck le CSS */
.game-page {
  padding: 8px 0;
}

.game-panel {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
</style>
