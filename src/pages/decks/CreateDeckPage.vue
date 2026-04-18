<template>
  <section class="deck-form-page">
    <NFlex align="center" class="page-header">
      <RouterLink :to="ROUTES.HOME"><NButton>← Retour</NButton></RouterLink>
      <h1>Créer un deck</h1>
    </NFlex>

    <NForm
      ref="formRef"
      :model="form"
      :rules="rules"
      class="deck-form"
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

    <!-- clearable sert à afficher une petite croix permettant d'effacer le contenu -->
    <NInput
      v-model:value="searchQuery"
      clearable
      placeholder="Rechercher une carte par nom"
      class="search-input"
    />

    <ListCardComponent
      :cards="filteredCards"
      :selected-card-ids="selectedCardIds"
      @update-selected-cards="handleSelectedCardsChange"
    />
  </section>
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
  // trim = on enlève les espaces avant et après la recherche
  // toLowerCase = pour ne pas être sensible à la casse
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return cards.value

  // on filtre les cartes dont le nom contient la recherche
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
.deck-form-page {
  width: 100%;
}

.page-header {
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.page-header h1 {
  margin: 0;
}

.deck-form {
  width: 100%;
}

.search-input {
  margin-bottom: 12px;
}

.validate {
  color: green;
}

@media (max-width: 640px) {
  .page-header {
    align-items: flex-start;
  }
}
</style>
