import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { computed, ref } from 'vue'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null)
  const socketId = ref<string | null>(null)
  const error = ref<string | null>(null)

  const isConnected = computed(() => !!socketId.value)

  const connect = (token: string): void => {
    if (socket.value?.connected) return

    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    })

    socket.value = s

    s.on('connect', () => {
      socketId.value = s.id ?? null
      error.value = null
    })

    s.on('disconnect', () => {
      socketId.value = null
    })

    s.on('connect_error', (err: Error) => {
      error.value = err.message
    })
  }

  const disconnect = (): void => {
    socket.value?.disconnect()
    socket.value = null
    socketId.value = null
    error.value = null
  }

  return { socketId, error, isConnected, connect, disconnect }
})
