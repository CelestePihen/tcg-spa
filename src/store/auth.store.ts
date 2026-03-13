// src/store/auth.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useApi } from '@/composables/useApi.ts'
import { useStorage } from '@/composables/useStorage.ts'
import type { SignInPayload, SignUpPayload, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const { get, set, remove } = useStorage()
  const api = useApi()

  const token = ref(get<string>('token'))
  const user = ref(get<User>('user'))

  const isAuthenticated = computed(
    () => !!(token.value && user.value), // le !! sert à convertir n'importe quelle valeur en booléen strict
  )

  const signUp = async (payload: SignUpPayload) => {
    const { email, password, username } = payload
    const response = await api.signUp({
      email: email,
      password: password,
      username: username,
    })

    token.value = response.token
    user.value = response.user
    set('token', response.token)
    set('user', response.user)
  }

  const signIn = async (payload: SignInPayload) => {
    const { email, password } = payload
    const response = await api.signIn({
      email: email,
      password: password,
    })

    token.value = response.token
    user.value = response.user
    set('token', response.token)
    set('user', response.user)
  }

  const signOut = () => {
    token.value = ''
    user.value = null
    remove('token')
    remove('user')
  }

  return { token, user, isAuthenticated, signUp, signIn, signOut }
})
