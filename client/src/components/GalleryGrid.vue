<script setup>
import { computed } from 'vue';
import { buildImageUrl } from '../api/http';

const props = defineProps({
  photos: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select']);

const preparedPhotos = computed(() =>
  props.photos.map((photo) => ({
    ...photo,
    imageUrl: buildImageUrl(photo.url || `/uploads/${photo.filename}`),
  }))
);
</script>

<template>
  <section class="gallery-grid">
    <div v-if="props.loading && preparedPhotos.length === 0" class="gallery-grid__loading">
      正在加载作品...
    </div>
    <button
      v-for="photo in preparedPhotos"
      :key="photo.id"
      class="gallery-grid__item"
      @click="emit('select', photo)"
    >
      <img :src="photo.imageUrl" :alt="photo.title || photo.originalName" loading="lazy" />
    </button>
  </section>
</template>

