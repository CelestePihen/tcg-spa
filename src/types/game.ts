import type { Card } from './card.js'

export type PlayerRole = 'host' | 'guest'

export interface LobbyRoom {
  id: string
  name: string
  hostUsername: string | null
  playersCount: number
  maxPlayers: number
  status: string
}

export interface GameCard extends Card {
  currentHp: number
}

export interface PlayerBoard {
  id: number | string | null
  username: string | null
  role: PlayerRole | null
  score: number
  activeCard: GameCard | null
  hand: GameCard[]
  deckCount: number
}

export interface GameResult {
  winnerRole: PlayerRole | null
  didIWin: boolean
  reason: string | null
  winnerUsername: string | null
}
