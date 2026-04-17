<template>
  <NFlex align="center">
    <RouterLink :to="ROUTES.HOME"><NButton>← Retour</NButton></RouterLink>
    <h1>Modifier le deck</h1>
  </NFlex>

  <NForm
    ref="formRef"
    :model="form"
    :rules="rules"
    @submit.prevent="handleUpdateDeck"
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
        >Enregistrer</NButton
      >
    </NFlex>
  </NForm>

  <!-- clearable sert à afficher une petite croix permettant d'effacer le contenu -->
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
import { useRoute, useRouter } from 'vue-router'

import ListCardComponent from '@/components/card/ListCardComponent.vue'
import { useApi } from '@/composables/useApi.ts'
import { ROUTES } from '@/router.ts'
import type { Card, Deck } from '@/types'

const message = useMessage()
const api = useApi()
const route = useRoute()
const router = useRouter()

const myDeck = ref<Deck>({
  cards: [],
  id: -1,
  name: "Missingno's Deck",
  userId: -1,
})

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
    await router.push(ROUTES.HOME)
  }
}

const fetchDeck = async () => {
  const deckId = route.params.deckId

  // vérifier s'il y a bien un Id et VueRouter qui envoie un tableau (pourquoi ?)
  if (!deckId || Array.isArray(deckId)) {
    await router.push(ROUTES.HOME)
    return
  }

  try {
    // vérifier si c'est un ID valide
    const newDeckId = Number(deckId)
    if (Number.isNaN(newDeckId)) {
      await router.push(ROUTES.HOME)
      return
    }

    myDeck.value = await api.getDeck(newDeckId)
    form.value.deckName = myDeck.value.name

    for (const deckCard of myDeck.value.cards) {
      selectedCardIds.value.add(deckCard.cardId)
    }
  } catch (e) {
    if (e instanceof Error) {
      message.error(e.message)
    } else {
      message.error('Erreur inconnue')
    }
    await router.push(ROUTES.HOME)
  }
}

const handleSelectedCardsChange = (ids: Set<number>) => {
  selectedCardIds.value = ids
}

const handleUpdateDeck = (_event: MouseEvent) => {
  formRef.value?.validate(async (errors: FormValidationError[] | undefined) => {
    if (!errors) {
      try {
        isLoading.value = true
        await api.updateDeck(myDeck.value.id, {
          name: form.value.deckName,
          cards: [...selectedCardIds.value],
        })
        message.info('Deck mis à jour')
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
onMounted(fetchDeck)
</script>

<style scoped>
.validate {
  color: green;
}
</style>
