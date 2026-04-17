<template>
  <NFlex align="center">
    <RouterLink :to="ROUTES.HOME"><NButton>← Retour</NButton></RouterLink>
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

    <p :class="{ validate: selectedCardIds.size === 10 }">
      {{ selectedCardIds.size }}/10 cartes sélectionnées
    </p>

    <NFlex vertical style="margin-bottom: 20px">
      <NButton
        attr-type="submit"
        :disabled="selectedCardIds.size !== 10 || !form.deckName || isLoading"
        type="primary"
        >Créer le deck</NButton
      >
    </NFlex>
  </NForm>

  <NInput
    v-model:value="searchQuery"
    clearable
    placeholder="Rechercher une carte par nom"
    style="margin-bottom: 12px"
  />

  <ListCardComponent
    :cards="filteredCards"
    :selected-card-ids="selectedCardIds"
    @update-selected-cards="handleSelectedCardsChange"
  />
</template>

<script setup lang="ts">
import {
  type FormInst,
  type FormRules,
  type FormValidationError,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

import ListCardComponent from '@/components/card/ListCardComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import router, { ROUTES } from '@/router.ts'
import type { Card } from '@/types'

const message = useMessage()
const api = useApi()

const cards = ref<Card[]>([])
const selectedCardIds = ref<Set<number>>(new Set())
const isLoading = ref<boolean>(false)
const searchQuery = ref('')

const filteredCards = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return cards.value

  return cards.value.filter((card) => card.name.toLowerCase().includes(query))
})

const formRef = ref<FormInst | null>(null)
const form = ref({
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

const fetchCards = async () => {
  try {
    cards.value = await api.getCards()
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
  }
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
        await router.push(ROUTES.HOME)
      } catch (e) {
        if (e instanceof Error) message.error(e.message)
      } finally {
        isLoading.value = false
      }
    }
  })
}

onMounted(fetchCards)
</script>

<style scoped>
.validate {
  color: green;
}
</style>
