import type { Card } from './card.js'

export interface BackendPlayerBoard {
  activeCard: (Card & { currentHp?: number }) | null
  hand: Card[]
  deck: Card[]
  score: number
}

export interface BackendPlayerState {
  socketId: string
  board: BackendPlayerBoard
}

export interface BackendGameState {
  roomId: number | string
  status: string
  currentPlayerSocketId: string
  host: BackendPlayerState
  guest: BackendPlayerState
}

export interface GamePayload {
  message?: string
  gameState: BackendGameState
}

export interface RoomListItem {
  id: number | string
  hostSocketId?: string
}

export interface RoomCreatedPayload {
  roomId: number | string
}

export interface GameEndedPayload {
  winner: string
  message?: string
}
