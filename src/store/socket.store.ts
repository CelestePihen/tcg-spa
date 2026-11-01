import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { computed, ref } from 'vue'

import router, { ROUTES } from '@/router.ts'
import type {
  BackendGameState,
  BackendPlayerBoard,
  Card,
  GameCard,
  GameEndedPayload,
  GamePayload,
  GameResult,
  LobbyRoom,
  PlayerBoard,
  RoomCreatedPayload,
  RoomListItem,
} from '@/types'

const EMPTY_BOARD: PlayerBoard = {
  id: null,
  username: null,
  role: null,
  score: 0,
  activeCard: null,
  hand: [],
  deckCount: 0,
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const parsedUrl = new URL(apiBaseUrl)
const socketUrl = parsedUrl.origin
const subPath = parsedUrl.pathname.replace(/\/api$/, '').replace(/\/$/, '')
const socketPath = subPath ? `${subPath}/socket.io` : '/socket.io'

const toGameCard = (card: Card & { currentHp?: number }): GameCard => ({
  ...card,
  currentHp: card.currentHp ?? card.hp,
})

const toPlayerBoard = (
  role: 'host' | 'guest',
  socketId: string,
  board: BackendPlayerBoard,
): PlayerBoard => ({
  id: socketId,
  username: role === 'host' ? 'Hôte' : 'Invité',
  role,
  score: board.score,
  activeCard: board.activeCard ? toGameCard(board.activeCard) : null,
  hand: board.hand.map((card) => toGameCard(card)),
  deckCount: board.deck.length,
})

const isPersonalActionMessage = (message: string): boolean =>
  /\b(vous|votre|vos|inflige|gagnez)\b/i.test(message)

export const useSocketStore = defineStore('socket', () => {
  let socket: Socket | null = null

  const socketId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const rooms = ref<LobbyRoom[]>([])
  const currentRoomId = ref<number | string | null>(null)
  const gameState = ref<BackendGameState | null>(null)
  const gameResult = ref<GameResult | null>(null)
  const realtimeMessage = ref<string>('')
  const opponentDisconnected = ref<boolean>(false)

  const isConnected = computed(() => !!socketId.value)
  const isHost = computed(
    () => !!gameState.value && gameState.value.host.socketId === socketId.value,
  )

  const isMyTurn = computed(
    () =>
      !!gameState.value &&
      gameState.value.currentPlayerSocketId === socketId.value,
  )

  const myBoard = computed<PlayerBoard>(() => {
    if (!gameState.value || !socketId.value) return EMPTY_BOARD

    const isCurrentHost = gameState.value.host.socketId === socketId.value
    return isCurrentHost
      ? toPlayerBoard(
          'host',
          gameState.value.host.socketId,
          gameState.value.host.board,
        )
      : toPlayerBoard(
          'guest',
          gameState.value.guest.socketId,
          gameState.value.guest.board,
        )
  })

  const opponentBoard = computed<PlayerBoard>(() => {
    if (!gameState.value || !socketId.value) return EMPTY_BOARD

    const isCurrentHost = gameState.value.host.socketId === socketId.value
    return isCurrentHost
      ? toPlayerBoard(
          'guest',
          gameState.value.guest.socketId,
          gameState.value.guest.board,
        )
      : toPlayerBoard(
          'host',
          gameState.value.host.socketId,
          gameState.value.host.board,
        )
  })

  const requestRooms = (): void => {
    socket?.emit('getRooms')
  }

  const updateGameStateFromPayload = (payload: GamePayload): void => {
    const state = payload.gameState

    gameState.value = JSON.parse(JSON.stringify(state)) as BackendGameState
    currentRoomId.value = state.roomId

    if (payload.message) {
      const isCurrentActor = state.currentPlayerSocketId === socketId.value
      if (!isCurrentActor && isPersonalActionMessage(payload.message)) {
        realtimeMessage.value = ''
      } else {
        realtimeMessage.value = payload.message
      }
    }
  }

  const connect = (token: string): void => {
    if (socket) return

    const s = io(socketUrl, {
      path: socketPath,
      auth: { token },
    })

    socket = s

    s.on('connect', () => {
      socketId.value = s.id ?? null
      error.value = null
      requestRooms()
    })

    s.on('disconnect', () => {
      socketId.value = null
    })

    s.on('roomsList', (data: RoomListItem[]) => {
      rooms.value = data.map((room, index) => ({
        id: String(room.id),
        name: `Partie #${index + 1}`,
        hostUsername: null,
        playersCount: 1,
        maxPlayers: 2,
        status: 'waiting',
      }))
    })

    s.on('roomsListUpdated', (data: RoomListItem[]) => {
      rooms.value = data.map((room, index) => ({
        id: String(room.id),
        name: `Partie #${index + 1}`,
        hostUsername: null,
        playersCount: 1,
        maxPlayers: 2,
        status: 'waiting',
      }))
    })

    s.on('roomCreated', (payload: RoomCreatedPayload) => {
      currentRoomId.value = payload.roomId
      realtimeMessage.value = 'Partie créée. En attente...'
    })

    s.on('gameStarted', async (payload: GamePayload) => {
      updateGameStateFromPayload(payload)
      await router.push(ROUTES.GAME)
    })

    s.on('gameStateUpdated', (payload: GamePayload) => {
      updateGameStateFromPayload(payload)
    })

    s.on('gameEnded', (payload: GameEndedPayload) => {
      const amIHost = gameState.value?.host.socketId === socketId.value
      const didIWin =
        payload.winner === socketId.value ||
        (payload.winner === 'host' && amIHost) ||
        (payload.winner === 'guest' && amIHost === false)

      const winnerRole =
        payload.winner === 'host'
          ? 'host'
          : payload.winner === 'guest'
            ? 'guest'
            : null

      gameResult.value = {
        winnerRole,
        didIWin,
        reason: payload.message ?? null,
        winnerUsername: didIWin ? 'Vous' : 'Adversaire',
      }
      if (payload.message) {
        if (!didIWin && isPersonalActionMessage(payload.message)) {
          realtimeMessage.value = ''
        } else {
          realtimeMessage.value = payload.message
        }
      }
    })

    s.on('opponentDisconnected', () => {
      opponentDisconnected.value = true
      realtimeMessage.value = 'Adversaire déconnecté.'
    })

    s.on('connect_error', (err: Error) => {
      error.value = err.message
    })

    s.on('error', (err: { message: string } | string) => {
      error.value = typeof err === 'string' ? err : err.message
    })
  }

  const disconnect = (): void => {
    socket?.disconnect()
    socket = null
    socketId.value = null
    error.value = null
  }

  const createRoom = (deckId: number): void => {
    if (!socket) {
      error.value = 'Connexion non établie'
      return
    }

    socket.emit('createRoom', { deckId })
    setTimeout(() => {
      requestRooms()
    }, 300)
  }

  const joinRoom = (roomId: string, deckId: number): void => {
    if (!socket) {
      error.value = 'Connexion non établie'
      return
    }

    currentRoomId.value = roomId
    socket.emit('joinRoom', {
      roomId: Number(roomId),
      deckId,
    })
  }

  const drawCards = (): void => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('drawCards', { roomId: currentRoomId.value })
  }

  const playCard = (cardId: number): void => {
    if (!socket || currentRoomId.value === null) return

    const cardIndex = myBoard.value.hand.findIndex((card) => card.id === cardId)
    if (cardIndex < 0) return

    socket.emit('playCard', { roomId: currentRoomId.value, cardIndex })
  }

  const attack = (): void => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('attack', { roomId: currentRoomId.value })
  }

  const endTurn = (): void => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('endTurn', { roomId: currentRoomId.value })
  }

  const resetGame = (): void => {
    gameState.value = null
    gameResult.value = null
    currentRoomId.value = null
    realtimeMessage.value = ''
    error.value = null
    opponentDisconnected.value = false
    rooms.value = []
  }

  return {
    socketId,
    error,
    rooms,
    currentRoomId,
    gameState,
    gameResult,
    realtimeMessage,
    opponentDisconnected,
    isConnected,
    isHost,
    isMyTurn,
    myBoard,
    opponentBoard,
    connect,
    disconnect,
    requestRooms,
    createRoom,
    joinRoom,
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
  }
})
