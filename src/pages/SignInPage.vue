<template>
  <NFlex class="sign-in" align="center" justify="center" vertical>
    <NCard title="Connexion">
      <NForm
        ref="formRef"
        :model="user"
        :rules="rules"
        @submit.prevent="handleSignIn"
      >
        <NFormItem label="Email" path="email">
          <NInput v-model:value="user.email" placeholder="votre@email.com" />
        </NFormItem>

        <NFormItem label="Mot de passe" path="password">
          <NInput
            v-model:value="user.password"
            placeholder="********"
            show-password-on="click"
            type="password"
          />
        </NFormItem>

        <NButton
          attr-type="submit"
          :disabled="!user.email || !user.password || isLoading"
          block
          type="primary"
          >Se connecter</NButton
        >

        <NFlex align="center" justify="center">
          <p>Pas encore de compte ?</p>
          <RouterLink to="/sign-up">S'inscrire</RouterLink>
        </NFlex>
      </NForm>
    </NCard>
  </NFlex>
</template>

<script lang="ts" setup>
import type { FormInst, FormRules, FormValidationError } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router.ts'
import { useAuthStore } from '@/store/auth.store.ts'

interface ModelType {
  email: string
  password: string
}

const message = useMessage()
const router = useRouter()

const formRef = ref<FormInst | null>(null)
const user = ref<ModelType>({
  email: '',
  password: '',
})
const isLoading = ref<boolean>(false)

const rules: FormRules = {
  email: [
    {
      required: true,
    },
  ],
  password: [
    {
      required: true,
    },
  ],
}

function handleSignIn(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate(async (errors: FormValidationError[] | undefined) => {
    if (!errors) {
      try {
        isLoading.value = true
        await useAuthStore().signIn(user.value)
        await router.push(ROUTES.HOME)
        message.info('Vous êtes connecté(e)')
      } catch (error) {
        isLoading.value = false
        if (error instanceof Error) message.error(error.message)
      }
    }
  })
}
</script>

<style scoped>
.sign-in {
  min-height: 100vh;
}

.n-card {
  max-width: 400px;
}
</style>
