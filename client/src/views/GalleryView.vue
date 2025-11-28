<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePhotoStore } from '../stores/photoStore';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import GalleryGrid from '../components/GalleryGrid.vue';
import PhotoModal from '../components/PhotoModal.vue';
import UserUploadForm from '../components/UserUploadForm.vue';

const router = useRouter();
const photoStore = usePhotoStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const modalOpen = ref(false);
const loadingMore = ref(false);
const showUploadModal = ref(false);

// 滚动懒加载
const handleScroll = async () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // 当滚动到底部200px以内时加载更多
  if (scrollTop + windowHeight >= documentHeight - 200) {
    if (!photoStore.loading && !loadingMore.value && photoStore.hasMore) {
      loadingMore.value = true;
      await photoStore.loadMore();
      loadingMore.value = false;
    }
  }
};

onMounted(() => {
  photoStore.fetchPhotos(true); // 重置并加载第一页
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const openModal = (photo) => {
  router.push(`/photo/${photo.id}`);
};

const closeModal = () => {
  modalOpen.value = false;
  photoStore.clearSelection();
};

const goToAuth = () => {
  router.push('/auth');
};

const userLogout = () => {
  userStore.logout();
};

const adminLogout = () => {
  authStore.logout();
};

const showUploadDialog = () => {
  router.push('/upload');
};

const closeUploadDialog = () => {
  showUploadModal.value = false;
};

const handleUploadSuccess = (data) => {
  // 上传成功后刷新照片列表
  photoStore.fetchPhotos(true);
  closeUploadDialog();
};
</script>

<template>
  <div class="gallery-page">
    <nav class="gallery-nav">
      <div class="gallery-nav__content">
        <div class="gallery-nav__brand">
          <span class="gallery-nav__logo">PDCabinet</span>
        </div>
        <div class="gallery-nav__actions">
          <!-- 管理员登录状态 -->
          <template v-if="authStore.isLoggedIn">
            <span class="user-info">管理员：{{ authStore.admin?.username }}</span>
            <button class="btn btn--primary" @click="showUploadDialog">
              📤 上传
            </button>
            <button class="btn btn--ghost" @click="adminLogout">退出</button>
          </template>
          <!-- 普通用户登录状态 -->
          <template v-else-if="userStore.isLoggedIn">
            <span class="user-info">欢迎，{{ userStore.user?.username }}</span>
            <button class="btn btn--primary" @click="showUploadDialog">
              📤 上传
            </button>
            <button class="btn btn--ghost" @click="userLogout">退出</button>
          </template>
          <!-- 未登录状态 -->
          <template v-else>
            <button class="btn btn--ghost" @click="goToAuth">登录/注册</button>
          </template>
        </div>
      </div>
    </nav>

    <div class="gallery-page__content">
      <header class="gallery-header">
        <div>
          <p class="gallery-header__eyebrow">PDCabinet · COLLECTION</p>
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
      <div v-if="loadingMore || (photoStore.loading && photoStore.photos.length > 0)" class="loading-more">
        正在加载更多作品...
      </div>
      <div v-if="!photoStore.hasMore && photoStore.photos.length > 0" class="no-more">
        已加载全部作品
      </div>
      <PhotoModal :photo="photoStore.selectedPhoto" :open="modalOpen" @close="closeModal" />
    </div>

    <!-- 用户上传模态框 -->
    <UserUploadForm
      v-if="showUploadModal"
      @success="handleUploadSuccess"
      @close="closeUploadDialog"
    />

    <!-- 页脚版权信息 -->
    <footer class="site-footer">
      <div class="footer-content">
        <p>
          © 2025
          <a href="https://pixris.online" target="_blank" rel="noopener noreferrer" class="footer-link">
            Pixris
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
  padding: 2rem 0;
  background: rgba(5, 8, 20, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  bottom: 0;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.footer-link {
  color: #ff6792;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #ff4d7c;
}

@media (max-width: 768px) {
  .site-footer {
    margin-top: 2rem;
    padding: 1.5rem 0;
  }

  .footer-content {
    padding: 0 1rem;
  }
}
</style>

