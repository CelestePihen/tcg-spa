<template>
  <NCard
    :hoverable="!disabled"
    :class="[
      `size-${size}`,
      {
        selected: selected,
        disabled: disabled,
        'border-radius': '5px',
      },
    ]"
    @click="!disabled && emit('select-card', card, selected)"
  >
    <img :src="card.imgUrl" :alt="`Image de ${card.name}`" />
    <p>#{{ card.pokedexNumber }}</p>
    <p>{{ card.name }}</p>
    <p
      :style="{
        backgroundColor: useColors().getTypeColor(card.type),
        color: 'white',
        padding: '0.15rem 0.5rem',
        'border-radius': '6px',
      }"
    >
      {{ card.type }}
    </p>

    <NProgress
      v-if="showHp"
      :color="useColors().hpColor(currentHpPercentage)"
      style="margin-top: 10px; margin-bottom: 10px"
      type="line"
      :show-indicator="false"
      :percentage="currentHpPercentage"
    >
    </NProgress>

    <p v-if="!showHp">❤️{{ card.hp }} · ⚔️{{ card.attack }}</p>
    <p v-else>❤️{{ currentHp }} / {{ card.hp }} · ⚔️{{ card.attack }}</p>
  </NCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useColors } from '@/composables/useColors.ts'
import type { Card } from '@/types'

interface CardProps {
  card: Card
  size?: 'sm' | 'md'
  selected?: boolean
  disabled?: boolean
  showHp?: boolean
}

const props = withDefaults(defineProps<CardProps>(), {
  size: 'md',
  selected: false,
  disabled: false,
  showHp: false,
})

const currentHp = ref<number>(props.card.hp)
const currentHpPercentage = computed(() => {
  const pct = (currentHp.value / props.card.hp) * 100
  return Math.max(0, Math.min(100, pct))
})

const emit = defineEmits<{ 'select-card': [Card, boolean] }>()
</script>

<style scoped>
.selected {
  background-color: #f0fff8;
  border: 3px solid green;
}

.disabled {
  opacity: 50%;
}

p {
  width: fit-content;
  margin: 0 auto;
  text-align: center;
}

.size-sm {
  width: 200px;
}

.size-sm img {
  width: 100%;
  height: 100px;
  object-fit: contain;
}

.size-md img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
