<template>
  <NModal
    :show="show"
    preset="card"
    :mask-closable="false"
    style="max-width: 420px"
  >
    <NFlex vertical :size="12">
      <h2>Partie terminée</h2>

      <NAlert :type="result?.didIWin ? 'success' : 'error'" :bordered="false">
        {{ result?.didIWin ? 'Vous avez gagné !' : 'Vous avez perdu.' }}
      </NAlert>

      <NText v-if="result?.winnerUsername" depth="3">
        Gagnant: {{ result.winnerUsername }}
      </NText>

      <NText v-if="result?.reason" depth="3">
        {{ result.reason }}
      </NText>

      <NButton type="primary" block @click="emit('back-to-lobby')">
        Retourner au lobby
      </NButton>
    </NFlex>
  </NModal>
</template>

<script setup lang="ts">
import type { GameResult } from '@/types'

interface GameEndModalComponentProps {
  show: boolean
  result: GameResult | null
}

defineProps<GameEndModalComponentProps>()

const emit = defineEmits<(e: 'back-to-lobby') => void>()
</script>
