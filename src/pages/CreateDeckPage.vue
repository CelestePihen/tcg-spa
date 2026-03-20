<template>
  <NFlex align="center">
    <NButton>← Retour</NButton>
    <h1>Créer un deck</h1>
  </NFlex>

  <NForm
    ref="formRef"
    :model="form"
    :rules="rules"
    @submit.prevent="handleCreateDeck"
  >
    <NFormItem label="Nom du deck" path="deckName">
      <NInput v-model:value="form.deckName" placeholder="Mon super deck" />
    </NFormItem>

    <p>{{ selectedCardIds.size }}/10 cartes sélectionnées</p>

    <NFlex vertical style="margin-bottom: 20px">
      <NButton
        attr-type="submit"
        :disabled="selectedCardIds.size === 0 || !form.deckName || isLoading"
        type="primary"
        >Créer le deck</NButton
      >
    </NFlex>
  </NForm>

  <ListCardComponent @update-selected-cards="handleSelectedCardsChange" />
</template>

<script setup lang="ts">
import {
  type FormInst,
  type FormRules,
  type FormValidationError,
  useMessage,
} from 'naive-ui'
import { ref } from 'vue'

import ListCardComponent from '@/components/ListCardComponent.vue'
import { useApi } from '@/composables/useApi.ts'

interface ModelType {
  deckName: string
}

const message = useMessage()
const api = useApi()

const selectedCardIds = ref<Set<number>>(new Set())
const isLoading = ref<boolean>(false)

const formRef = ref<FormInst | null>(null)
const form = ref<ModelType>({
  deckName: '',
})

const rules: FormRules = {
  deckName: [
    {
      required: true,
      message: 'Un nom de deck est requis',
      trigger: 'blur',
    },
  ],
}

const handleSelectedCardsChange = (ids: Set<number>) => {
  selectedCardIds.value = ids
}

const handleCreateDeck = (_event: MouseEvent) => {
  formRef.value?.validate(async (errors: FormValidationError[] | undefined) => {
    if (!errors) {
      try {
        isLoading.value = true
        await api.createDeck({
          name: form.value.deckName,
          cards: [...selectedCardIds.value],
        })
        message.info('Deck créée')
      } catch (e) {
        if (e instanceof Error) message.error(e.message)
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.card {
  height: 100%;
}
</style>
