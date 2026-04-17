<template>
  <NFlex class="sign-up" align="center" justify="center" vertical>
    <NCard title="Inscription">
      <NForm ref="formRef" :model="user" :rules="rules">
        <NFormItem label="Nom d'utilisateur" path="username">
          <NInput
            v-model:value="user.username"
            placeholder="Dresseur42"
            @keydown.enter.prevent
          />
        </NFormItem>

        <NFormItem label="Email" path="email">
          <NInput
            v-model:value="user.email"
            placeholder="votre@email.com"
            @keydown.enter.prevent
          />
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
          :disabled="!user.username || !user.email || !user.password"
          block
          type="primary"
          @click="handleSignUp"
          >S'inscrire</NButton
        >

        <NFlex align="center" justify="center">
          <p>Déjà un compte ?</p>
          <RouterLink to="/sign-in">Se connecter</RouterLink>
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
  username: string
  email: string
  password: string
}

const message = useMessage()
const router = useRouter()

const formRef = ref<FormInst | null>(null)
const user = ref<ModelType>({
  username: '',
  email: '',
  password: '',
})
const isLoading = ref<boolean>(false)

const rules: FormRules = {
  username: [
    {
      required: true,
      message: "Un nom d'utilisateur est requis",
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: true,
      message: 'Un email est requis',
      trigger: 'blur',
    },
    {
      // utilisation d'un regex pour valider le format de l'email
      // ^ = début de la chaîne
      // [^\s@]+ = un ou plusieurs caractères qui ne sont pas des espaces ou des @
      // @ = le symbole @
      // \. = un point (doit être échappé car le point est un caractère spécial en regex)
      // $ = fin de la chaîne
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Veuillez entrer un email valide',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: 'Un mot de passe est requis',
      trigger: 'blur',
    },
  ],
}

function handleSignUp(e: MouseEvent) {
  e.preventDefault()
  formRef.value?.validate(async (errors: FormValidationError[] | undefined) => {
    if (!errors) {
      try {
        isLoading.value = true
        await useAuthStore().signUp(user.value)
        await router.push(ROUTES.HOME)
        message.info('Vous êtes enregistré(e)')
      } catch (e) {
        isLoading.value = false
        if (e instanceof Error) message.error(e.message)
      }
    }
  })
}
</script>

<style scoped>
.sign-up {
  min-height: 100vh;
}

.n-card {
  max-width: 400px;
}
</style>
