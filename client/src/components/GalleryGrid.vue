<script setup>
import { computed, ref, onMounted, nextTick } from 'vue';
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

// 图片加载状态管理
const imageLoadStatus = ref(new Map());
const hoveredPhoto = ref(null);
const gridColumns = ref([]);

// 瀑布流布局算法
const createMasonryLayout = () => {
  const columns = 4;
  const cols = Array(columns).fill(0);
  const result = Array(columns).fill(null).map(() => []);

  props.photos.forEach((photo, index) => {
    // 计算图片的宽高比，决定span
    const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1;
    let span = 1;

    // 根据宽高比和图片尺寸决定占据的列数
    if (aspectRatio > 1.5) {
      span = 2; // 宽图片占据2列
    } else if (aspectRatio < 0.7) {
      span = 1; // 竖图片占据1列
    } else {
      span = 1; // 方图片占据1列
    }

    // 找到高度最小的列
    let minHeight = Infinity;
    let minCol = 0;

    for (let i = 0; i <= columns - span; i++) {
      let totalHeight = 0;
      for (let j = 0; j < span; j++) {
        totalHeight += cols[i + j];
      }
      if (totalHeight < minHeight) {
        minHeight = totalHeight;
        minCol = i;
      }
    }

    // 添加图片到选中的列
    const photoData = {
      ...photo,
      span,
      aspectRatio,
      imageUrl: buildImageUrl(photo.url || `/uploads/${photo.filename}`),
      thumbnailUrl: photo.thumbnailUrl ? buildImageUrl(photo.thumbnailUrl) : null,
    };

    result[minCol].push(photoData);

    // 更新列高度（模拟）
    const estimatedHeight = span === 2 ? 200 : 300; // 估算高度
    for (let i = 0; i < span; i++) {
      cols[minCol + i] += estimatedHeight;
    }
  });

  return result;
};

const handleImageLoad = (photoId) => {
  imageLoadStatus.value.set(photoId, 'loaded');
};

const handleImageError = (photoId) => {
  imageLoadStatus.value.set(photoId, 'error');
};

const handleMouseEnter = (photoId) => {
  hoveredPhoto.value = photoId;
};

const handleMouseLeave = () => {
  hoveredPhoto.value = null;
};

const masonryColumns = computed(() => createMasonryLayout());
</script>

<template>
  <section class="gallery-grid">
    <div v-if="props.loading && masonryColumns.flat().length === 0" class="gallery-grid__loading">
      正在加载作品...
    </div>

    <div class="masonry-container">
      <div
        v-for="(column, colIndex) in masonryColumns"
        :key="colIndex"
        class="masonry-column"
      >
        <button
          v-for="photo in column"
          :key="photo.id"
          class="gallery-grid__item"
          :class="{
            'is-hovered': hoveredPhoto === photo.id,
            'span-2': photo.span === 2
          }"
          :style="{ aspectRatio: photo.aspectRatio }"
          @click="emit('select', photo)"
          @mouseenter="handleMouseEnter(photo.id)"
          @mouseleave="handleMouseLeave"
        >
          <div class="image-container">
            <img
              :src="photo.thumbnailUrl || photo.imageUrl"
              :alt="photo.title || photo.originalName"
              loading="lazy"
              @load="handleImageLoad(photo.id)"
              @error="handleImageError(photo.id)"
              :class="{ 'loaded': imageLoadStatus.get(photo.id) === 'loaded' }"
            />
            <div v-if="imageLoadStatus.get(photo.id) !== 'loaded'" class="image-placeholder">
              <div class="loading-spinner"></div>
            </div>

            <!-- 悬停时显示的高清图预加载 -->
            <div v-if="hoveredPhoto === photo.id" class="hover-preview">
              <img
                :src="photo.imageUrl"
                loading="lazy"
                alt=""
                class="hover-preview-img"
              />
            </div>

            <!-- 悬停遮罩层 -->
            <div v-if="hoveredPhoto === photo.id" class="hover-overlay">
              <div class="hover-content">
                <h4 v-if="photo.title" class="photo-title">{{ photo.title }}</h4>
                <p v-if="photo.camera" class="photo-camera">{{ photo.camera }}</p>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 瀑布流容器 */
.masonry-container {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 图片项基础样式 */
.gallery-grid__item {
  position: relative;
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: pointer;
  display: block;
  overflow: hidden;
  border-radius: 1.25rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateY(0) scale(1);
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.gallery-grid__item.is-hovered {
  transform: translateY(-8px) scale(1.03);
  z-index: 10;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* 宽图片占据2列 */
.gallery-grid__item.span-2 {
  grid-column: span 2;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

.image-container img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: inherit;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: scale(1);
}

.image-container img.loaded {
  opacity: 1;
}

.gallery-grid__item.is-hovered .image-container img {
  transform: scale(1.1);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 悬停预览层 */
.hover-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 5;
}

.gallery-grid__item.is-hovered .hover-preview {
  opacity: 1;
  transform: scale(1);
}

.hover-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

/* 悬停遮罩层 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border-radius: inherit;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  z-index: 6;
}

.gallery-grid__item.is-hovered .hover-overlay {
  opacity: 1;
  transform: translateY(0);
}

.hover-content {
  color: white;
  text-align: left;
  transform: translateY(10px);
  transition: transform 0.3s ease 0.1s;
}

.gallery-grid__item.is-hovered .hover-content {
  transform: translateY(0);
}

.photo-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.photo-camera {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 图片项入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .masonry-container {
    gap: 1.25rem;
  }

  .masonry-column {
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .masonry-container {
    gap: 1rem;
  }

  .masonry-column {
    gap: 1rem;
  }

  .gallery-grid__item {
    border-radius: 1rem;
  }

  .hover-overlay {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .masonry-container {
    gap: 0.75rem;
  }

  .masonry-column {
    gap: 0.75rem;
  }

  .gallery-grid__item {
    border-radius: 0.75rem;
  }

  .photo-title {
    font-size: 0.95rem;
  }

  .photo-camera {
    font-size: 0.75rem;
  }
}
</style>
