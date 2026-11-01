<template>
  <section class="action-bar">
    <div class="action-status">
      <NTag :type="isMyTurn ? 'success' : 'warning'" size="small">
        {{ isMyTurn ? 'Votre tour' : 'Tour adverse' }}
      </NTag>
    </div>

    <p class="action-message">
      {{ realtimeMessage || 'En attente...' }}
    </p>

    <div class="action-buttons">
      <NButton size="small" :disabled="!canDraw" @click="emit('draw')"
        >Piocher</NButton
      >
      <NButton
        size="small"
        type="error"
        :disabled="!canAttack"
        @click="emit('attack')"
      >
        Attaquer
      </NButton>
      <NButton
        size="small"
        type="warning"
        :disabled="!canEndTurn"
        @click="emit('end-turn')"
      >
        Fin de tour
      </NButton>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ActionBarComponentProps {
  isMyTurn: boolean
  canDraw: boolean
  canAttack: boolean
  canEndTurn: boolean
  realtimeMessage: string
}

defineProps<ActionBarComponentProps>()

const emit = defineEmits<(e: 'draw' | 'attack' | 'end-turn') => void>()
</script>

<style scoped>
/* fuck le CSS */
.action-bar {
  align-items: center;
  border-bottom: 1px solid #ececec;
  border-top: 1px solid #ececec;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  min-height: 54px;
  padding: 10px;
}

.action-message {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: stretch;
}

.action-buttons :deep(.n-button) {
  flex: 1;
}

@media (min-width: 768px) {
  .action-bar {
    grid-template-columns: auto 1fr auto;
    padding: 0 10px;
  }

  .action-buttons :deep(.n-button) {
    flex: unset;
  }
}
</style>
