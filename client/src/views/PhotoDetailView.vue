<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { http, buildImageUrl } from '../api/http';
import { usePhotoStore } from '../stores/photoStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { format } from 'date-fns';
import StarRating from '../components/StarRating.vue';

const router = useRouter();
const route = useRoute();
const photoStore = usePhotoStore();
const authStore = useAuthStore();
const userStore = useUserStore();

const photo = ref(null);
const loading = ref(true);
const error = ref('');

// 参数面板折叠状态
const collapsedGroups = ref({
  basic: false,
  shooting: false,
  file: true,
  location: true
});

// 格式化日期
const formattedDate = (value) => {
  if (!value) return '未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'yyyy.MM.dd HH:mm:ss');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 参数分组
const groupedMetaList = computed(() => {
  if (!photo.value) return {};

  return {
    basic: [
      { label: '制造商', value: photo.value.manufacturer },
      { label: '相机型号', value: photo.value.model },
      { label: '镜头', value: photo.value.lens },
      { label: '自定义相机', value: photo.value.camera }
    ].filter(item => item.value),
    shooting: [
      { label: '拍摄时间', value: formattedDate(photo.value.takenAt) },
      { label: '曝光时间', value: photo.value.exposureTime },
      { label: '光圈值', value: photo.value.aperture },
      { label: 'ISO速度', value: photo.value.iso },
      { label: '焦距', value: photo.value.focalLength }
    ].filter(item => item.value),
    file: [
      { label: '尺寸', value: photo.value.width && photo.value.height ? `${photo.value.width} × ${photo.value.height}` : '' },
      { label: '文件大小', value: photo.value.fileSize ? formatFileSize(photo.value.fileSize) : '' },
      { label: '修改时间', value: formattedDate(photo.value.modifiedAt) },
      { label: '创建时间', value: formattedDate(photo.value.createdAt) }
    ].filter(item => item.value),
    location: [
      { label: '拍摄地点', value: photo.value.location },
      { label: '拍摄时间', value: formattedDate(photo.value.shotAt) }
    ].filter(item => item.value)
  };
});

// 获取分组标题
const getGroupTitle = (group) => {
  const titles = {
    basic: '📷 基本信息',
    shooting: '⚙️ 拍摄参数',
    file: '📄 文件信息',
    location: '📍 位置信息'
  };
  return titles[group] || group;
};

// 切换分组折叠状态
const toggleGroup = (group) => {
  collapsedGroups.value[group] = !collapsedGroups.value[group];
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 获取照片详情
const fetchPhotoDetail = async () => {
  const photoId = route.params.id;
  if (!photoId) {
    error.value = '照片ID缺失';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const response = await http.get(`/photos/${photoId}`);
    photo.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || '获取照片详情失败';
  } finally {
    loading.value = false;
  }
};

// 不再提供编辑和删除功能，照片一旦上传就不可修改

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    goBack();
  }
};

onMounted(() => {
  fetchPhotoDetail();
  document.addEventListener('keydown', handleKeydown);
});

// 清理事件监听器
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="photo-detail-page">
    <nav class="photo-detail-nav">
      <div class="photo-detail-nav__container">
        <div class="photo-detail-nav__brand">
          <span class="photo-detail-nav__logo" @click="goBack">PDCabinet</span>
        </div>
        <div class="photo-detail-nav__actions">
          <button class="btn btn--ghost" @click="goBack">← 返回</button>
        </div>
      </div>
    </nav>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载照片详情...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button class="btn btn--primary" @click="goBack">返回</button>
    </div>

    <div v-else-if="photo" class="photo-detail-content">
      <div class="photo-viewer">
        <img
          :src="buildImageUrl(photo.url || `/uploads/${photo.filename}`)"
          :alt="photo.title || '未命名作品'"
          class="photo-image"
        />
      </div>

      <div class="photo-info">
        <div class="photo-header">
          <div class="photo-title-section">
            <h1>{{ photo.title || '未命名作品' }}</h1>
            <p v-if="photo.description" class="photo-description">{{ photo.description }}</p>
            <p class="photo-uploader">上传者：{{ photo.createdBy || '未知用户' }}</p>
          </div>
          <div class="photo-rating">
            <StarRating :model-value="Number(photo.rating) || 0" :max="7" />
          </div>
        </div>

        <div class="photo-meta-groups">
          <div v-for="(items, group) in groupedMetaList" :key="group" class="meta-group" v-show="items.length > 0">
            <button class="meta-group__header" @click="toggleGroup(group)">
              <h3 class="meta-group__title">{{ getGroupTitle(group) }}</h3>
              <span class="meta-group__toggle" :class="{ 'is-collapsed': collapsedGroups[group] }">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </span>
            </button>
            <div class="meta-group__content" :class="{ 'is-collapsed': collapsedGroups[group] }">
              <dl class="modal__meta">
                <template v-for="item in items" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </template>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

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
.photo-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 15% 30%, rgba(255, 78, 162, 0.15), transparent 60%),
    radial-gradient(circle at 85% 20%, rgba(101, 132, 255, 0.15), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(255, 103, 146, 0.1), transparent 70%),
    linear-gradient(135deg, #03050b 0%, #0a0c1a 50%, #070914 100%);
}

.photo-detail-nav {
  background: rgba(5, 8, 20, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.photo-detail-nav__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-detail-nav__logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(120deg, #ff6792, #715aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.photo-detail-nav__logo:hover {
  opacity: 0.8;
}

.photo-detail-nav__actions {
  display: flex;
  gap: 1rem;
}

.photo-detail-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.photo-viewer {
  margin-bottom: 3rem;
  text-align: center;
}

.photo-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.photo-info {
  background: rgba(5, 8, 20, 0.5);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.photo-title-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: white;
}

.photo-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.photo-uploader {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.photo-rating {
  display: flex;
  align-items: center;
}

.photo-meta-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-group {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.meta-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.meta-group__header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.meta-group__title {
  margin: 0;
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.meta-group__toggle {
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.6);
}

.meta-group__toggle.is-collapsed {
  transform: rotate(-90deg);
}

.meta-group__content {
  max-height: 400px;
  overflow: hidden;
  overflow-y: auto;
  transition: max-height 0.3s ease;
  padding: 0 1rem;
}

.meta-group__content.is-collapsed {
  max-height: 0;
  padding: 0 1rem;
}

.modal__meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem 2rem;
  padding: 1rem 0;
}

.modal__meta dt {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
}

.modal__meta dd {
  color: white;
  margin: 0;
  font-size: 0.95rem;
  text-align: right;
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ff6792;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: #ff6792;
  margin-bottom: 1rem;
}

.error-container p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

/* 页脚样式 */
.site-footer {
  margin-top: auto;
  padding: 2rem 0;
  background: rgba(5, 8, 20, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .photo-detail-content {
    padding: 1rem;
  }

  .photo-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .photo-title-section h1 {
    font-size: 1.5rem;
  }

  .photo-image {
    max-height: 50vh;
  }

  .photo-info {
    padding: 1.5rem;
  }

  .modal__meta {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .modal__meta dd {
    text-align: left;
    margin-bottom: 1rem;
  }

  .site-footer {
    padding: 1.5rem 0;
  }

  .footer-content {
    padding: 0 1rem;
  }
}
</style>