<script setup>
import { onMounted, ref } from 'vue';
import { usePhotoStore } from '../stores/photoStore';
import GalleryGrid from '../components/GalleryGrid.vue';
import PhotoModal from '../components/PhotoModal.vue';

const photoStore = usePhotoStore();
const modalOpen = ref(false);

onMounted(() => {
  photoStore.fetchPhotos();
});

const openModal = (photo) => {
  photoStore.selectPhoto(photo);
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  photoStore.clearSelection();
};
</script>

<template>
  <div class="gallery-page">
    <header class="gallery-header">
      <div>
        <p class="gallery-header__eyebrow">CAMARTS · COLLECTION</p>
        <h1>沉浸式作品流</h1>
        <p>保持纯粹，只展示图像内容，更多信息在查看详情时呈现。</p>
      </div>
    </header>

    <GalleryGrid
      :photos="photoStore.photos"
      :loading="photoStore.loading"
      @select="openModal"
    />
    <div v-if="photoStore.error" class="alert">{{ photoStore.error }}</div>
    <p v-if="!photoStore.loading && photoStore.photos.length === 0" class="empty-hint">
      尚无作品，管理员上传后会自动出现在这里。
    </p>
    <PhotoModal :photo="photoStore.selectedPhoto" :open="modalOpen" @close="closeModal" />
  </div>
</template>

