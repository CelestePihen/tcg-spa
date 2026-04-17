<template>
  <section class="play-section">
    <h2 class="play-title">Jouer</h2>

    <NGrid cols="2" :x-gap="14" :y-gap="14">
      <NGi>
        <NCard title="Créer une partie" class="panel-card" size="small">
          <NSpin :show="isLoading">
            <NFlex vertical :size="10">
              <NSelect
                v-model:value="selectedDeckId"
                :options="deckOptions"
                clearable
                placeholder="Sélectionner un deck"
              />

              <NButton
                type="primary"
                class="action-btn"
                :disabled="!selectedDeckId"
                @click="handleCreateRoom"
              >
                Créer la partie
              </NButton>
            </NFlex>
          </NSpin>
        </NCard>
      </NGi>

      <NGi>
        <NCard title="Parties disponibles" class="panel-card" size="small">
          <NFlex
            v-if="rooms.length === 0"
            align="center"
            justify="center"
            style="min-height: 130px"
          >
            <NEmpty description="Aucune partie disponible pour l'instant." />
          </NFlex>

          <NFlex v-else vertical :size="10">
            <NCard
              v-for="room in roomsWithFallbackName"
              :key="room.id"
              embedded
              size="small"
            >
              <NFlex vertical :size="8">
                <NText strong>{{ room.name }}</NText>
                <NText depth="3"
                  >Hôte : {{ room.hostUsername ?? 'Inconnu' }}</NText
                >

                <NSelect
                  v-model:value="selectedDeckId"
                  :options="deckOptions"
                  clearable
                  placeholder="Sélectionner un deck"
                />

                <NButton
                  type="success"
                  ghost
                  class="action-btn"
                  :disabled="!selectedDeckId"
                  @click="handleJoinRoom(room.id)"
                >
                  Rejoindre
                </NButton>
              </NFlex>
            </NCard>
          </NFlex>
        </NCard>
      </NGi>
    </NGrid>
  </section>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { useApi } from '@/composables/useApi.ts'
import { useAuthStore } from '@/store/auth.store.ts'
import { useSocketStore } from '@/store/socket.store.ts'
import type { Deck } from '@/types'

const api = useApi()
const message = useMessage()
const authStore = useAuthStore()
const socketStore = useSocketStore()

const { token } = storeToRefs(authStore)
const { error, isConnected, rooms } = storeToRefs(socketStore)

const decks = ref<Deck[]>([])
const selectedDeckId = ref<number | null>(null)
const isLoading = ref<boolean>(false)

const deckOptions = computed(() =>
  decks.value.map((deck) => ({
    label: deck.name,
    value: deck.id,
  })),
)

const roomsWithFallbackName = computed(() =>
  rooms.value.map((room, index) => ({
    ...room,
    name: room.name?.trim() ? room.name : `Partie #${index + 1}`,
  })),
)

const fetchDecks = async (): Promise<void> => {
  try {
    isLoading.value = true
    decks.value = await api.getMyDecks()

    if (!selectedDeckId.value && decks.value.length > 0) {
      selectedDeckId.value = decks.value[0].id
    }
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
      return
    }

    message.error('Erreur inconnue lors du chargement des decks.')
  } finally {
    isLoading.value = false
  }
}

const handleCreateRoom = (): void => {
  if (!selectedDeckId.value) {
    message.warning('Sélectionnez un deck avant de créer une room.')
    return
  }

  socketStore.createRoom(selectedDeckId.value)
}

const handleJoinRoom = (roomId: string): void => {
  if (!selectedDeckId.value) {
    message.warning('Sélectionnez un deck avant de rejoindre une room.')
    return
  }

  socketStore.joinRoom(roomId, selectedDeckId.value)
}

watch(error, (value) => {
  if (!value) return
  message.error(value)
})

onMounted(async () => {
  if (token.value && !isConnected.value) {
    socketStore.connect(token.value)
  }

  await fetchDecks()
  socketStore.requestRooms()
})
</script>

<style scoped>
.play-section {
  margin: 8px 0 18px;
}

.play-title {
  margin: 0 0 10px;
  font-size: 28px;
}

.panel-card {
  min-height: 198px;
}

.action-btn {
  width: fit-content;
}

.room-id {
  font-size: 12px;
}
</style>
