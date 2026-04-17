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
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'

import ActionBarComponent from '@/components/game/ActionBarComponent.vue'
import GameEndModalComponent from '@/components/game/GameEndModalComponent.vue'
import GameZoneComponent from '@/components/game/GameZoneComponent.vue'
import PlayerHandComponent from '@/components/game/PlayerHandComponent.vue'
import router, { ROUTES } from '@/router.ts'
import { useAuthStore } from '@/store/auth.store.ts'
import { useSocketStore } from '@/store/socket.store.ts'

const message = useMessage()
const authStore = useAuthStore()
const socketStore = useSocketStore()

const { token } = storeToRefs(authStore)
const {
  error,
  gameResult,
  isConnected,
  isMyTurn,
  myBoard,
  opponentBoard,
  realtimeMessage,
} = storeToRefs(socketStore)

const { attack, drawCards, endTurn, playCard, resetGame } = socketStore

const canDraw = computed(
  () =>
    isMyTurn.value &&
    myBoard.value.hand.length < 5 &&
    myBoard.value.deckCount > 0,
)

const canAttack = computed(
  () =>
    isMyTurn.value &&
    !!myBoard.value.activeCard &&
    !!opponentBoard.value.activeCard,
)

const canEndTurn = computed(() => isMyTurn.value)

const handleBackToLobby = async (): Promise<void> => {
  resetGame()
  socketStore.requestRooms()
  await router.push(ROUTES.HOME)
}

watch(error, (value) => {
  if (value) message.error(value)
})

onMounted(() => {
  if (token.value && !isConnected.value) {
    socketStore.connect(token.value)
  }
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
