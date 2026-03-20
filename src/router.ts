import { createRouter, createWebHistory } from 'vue-router'

import CreateDeckPage from '@/pages/decks/CreateDeckPage.vue'
import DetailDeckPage from '@/pages/decks/DetailDeckPage.vue'
import UpdateDeckPage from '@/pages/decks/UpdateDeckPage.vue'
import { useAuthStore } from '@/store/auth.store.ts'

import SignInPage from './pages/auth/SignInPage.vue'
import SignUpPage from './pages/auth/SignUpPage.vue'
import HomePage from './pages/HomePage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  CREATE_DECK: '/create-deck',
  UPDATE_DECK: '/update-deck/:deckId',
  DETAILS_DECK: '/details-deck/:deckId',
} as const

const routes = [
  {
    path: ROUTES.SIGN_IN,
    component: SignInPage,
  },
  {
    path: ROUTES.SIGN_UP,
    component: SignUpPage,
  },
  {
    path: ROUTES.HOME,
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.CREATE_DECK,
    component: CreateDeckPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.UPDATE_DECK,
    component: UpdateDeckPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DETAILS_DECK,
    component: DetailDeckPage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return ROUTES.SIGN_IN
  }

  if (
    authStore.isAuthenticated &&
    (to.path === ROUTES.SIGN_IN || to.path === ROUTES.SIGN_UP)
  ) {
    return ROUTES.HOME
  }

  return true
})

export default router
