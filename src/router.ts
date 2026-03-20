import { createRouter, createWebHistory } from 'vue-router'

import CreateDeckPage from '@/pages/CreateDeckPage.vue'
import { useAuthStore } from '@/store/auth.store.ts'

import HomePage from './pages/HomePage.vue'
import SignInPage from './pages/SignInPage.vue'
import SignUpPage from './pages/SignUpPage.vue'

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
