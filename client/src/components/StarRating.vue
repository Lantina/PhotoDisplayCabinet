<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 7,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const stars = computed(() => {
  const value = Number(props.modelValue) || 0;
  return Array.from({ length: props.max }, (_, index) => index < value);
});

const handleSelect = (index) => {
  if (!props.editable) return;
  const next = index + 1 === props.modelValue ? index : index + 1;
  emit('update:modelValue', next);
};
</script>

<template>
  <div class="star-rating" :class="{ 'star-rating--readonly': !editable }">
    <button
      v-for="(filled, index) in stars"
      :key="index"
      type="button"
      :class="['star-rating__item', { filled }]"
      @click="handleSelect(index)"
    >
      ★
    </button>
  </div>
</template>

