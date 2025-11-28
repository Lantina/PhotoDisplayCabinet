<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { format } from 'date-fns';
import { buildImageUrl } from '../api/http';
import StarRating from './StarRating.vue';

const props = defineProps({
  photo: {
    type: Object,
    default: null,
  },
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const visible = computed(() => !!props.photo && props.open);
const isAnimating = ref(false);
const backdropVisible = ref(false);
const panelVisible = ref(false);
const imageLoading = ref(true);

// 动画控制
watch(visible, (newVal) => {
  if (newVal) {
    // 打开动画
    isAnimating.value = true;
    backdropVisible.value = true;
    imageLoading.value = true; // 重置加载状态
    setTimeout(() => {
      panelVisible.value = true;
    }, 50);
  } else {
    // 关闭动画
    panelVisible.value = false;
    setTimeout(() => {
      backdropVisible.value = false;
      isAnimating.value = false;
    }, 300);
  }
});

const handleClose = () => {
  emit('close');
};

const imageUrl = computed(() => {
  if (!props.photo) return '';
  return buildImageUrl(props.photo.url || `/uploads/${props.photo.filename}`);
});

const formattedDate = (value) => {
  if (!value) return '未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'yyyy.MM.dd HH:mm:ss');
};

const metaList = computed(() => {
  if (!props.photo) return [];
  return [
    { label: '制造商', value: props.photo.manufacturer },
    { label: '相机型号', value: props.photo.model },
    { label: '拍摄时间', value: formattedDate(props.photo.takenAt) },
    { label: '曝光时间', value: props.photo.exposureTime },
    { label: '光圈值', value: props.photo.aperture },
    { label: 'ISO速度', value: props.photo.iso },
    { label: '修改时间', value: formattedDate(props.photo.modifiedAt) },
    { label: '焦距', value: props.photo.focalLength },
    { label: '镜头', value: props.photo.lens },
    { label: '自定义相机', value: props.photo.camera },
  ].filter((item) => item.value);
});

const onImageLoad = () => {
  imageLoading.value = false;
};

const onImageError = () => {
  imageLoading.value = false;
};

// 参数分组和折叠状态 - 默认折叠后两个面板
const collapsedGroups = ref({
  basic: false,
  shooting: false,
  file: true,      // 默认折叠文件信息
  location: true   // 默认折叠位置信息
});

const hasScrollbar = ref(false);

const toggleGroup = (group) => {
  collapsedGroups.value[group] = !collapsedGroups.value[group];

  // 展开面板后重新检测滚动状态
  if (!collapsedGroups.value[group]) {
    nextTick(() => {
      checkScrollable();
    });
  }
};

// 分组参数列表
const groupedMetaList = computed(() => {
  if (!props.photo) return {};

  return {
    basic: [
      { label: '制造商', value: props.photo.manufacturer },
      { label: '相机型号', value: props.photo.model },
      { label: '镜头', value: props.photo.lens },
      { label: '自定义相机', value: props.photo.camera }
    ].filter(item => item.value),
    shooting: [
      { label: '拍摄时间', value: formattedDate(props.photo.takenAt) },
      { label: '曝光时间', value: props.photo.exposureTime },
      { label: '光圈值', value: props.photo.aperture },
      { label: 'ISO速度', value: props.photo.iso },
      { label: '焦距', value: props.photo.focalLength }
    ].filter(item => item.value),
    file: [
      { label: '尺寸', value: props.photo.width && props.photo.height ? `${props.photo.width} × ${props.photo.height}` : '' },
      { label: '文件大小', value: props.photo.fileSize ? formatFileSize(props.photo.fileSize) : '' },
      { label: '修改时间', value: formattedDate(props.photo.modifiedAt) },
      { label: '创建时间', value: formattedDate(props.photo.createdAt) }
    ].filter(item => item.value),
    location: [
      { label: '拍摄地点', value: props.photo.location },
      { label: '拍摄时间', value: formattedDate(props.photo.shotAt) }
    ].filter(item => item.value)
  };
});

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

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

// 检测滚动状态
const checkScrollable = () => {
  nextTick(() => {
    try {
      const modalBody = document.querySelector('.modal__body');
      if (modalBody) {
        // 等待DOM完全渲染后再检测
        setTimeout(() => {
          const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
          modalBody.classList.toggle('can-scroll', isScrollable);
          hasScrollbar.value = isScrollable;

          console.log('滚动检测:', {
            scrollHeight: modalBody.scrollHeight,
            clientHeight: modalBody.clientHeight,
            isScrollable: isScrollable
          });
        }, 100);

        // 添加滚动监听
        modalBody.addEventListener('scroll', handleScroll);
      }

      // 检测每个参数面板的滚动状态
      const metaGroups = document.querySelectorAll('.meta-group__content');
      metaGroups.forEach(group => {
        const isGroupScrollable = group.scrollHeight > group.clientHeight;
        group.classList.toggle('can-scroll', isGroupScrollable);
      });
    } catch (error) {
      console.warn('滚动检测失败:', error);
    }
  });
};

// 处理滚动事件
const handleScroll = (event) => {
  try {
    const modalBody = event.target;
    if (modalBody.scrollTop > 10) {
      modalBody.classList.add('scrolled');
    } else {
      modalBody.classList.remove('scrolled');
    }
  } catch (error) {
    console.warn('滚动处理失败:', error);
  }
};

// 滚动到下一个参数组
const scrollToNext = () => {
  try {
    const modalBody = document.querySelector('.modal__body');
    if (modalBody) {
      modalBody.scrollBy({
        top: 200,
        behavior: 'smooth'
      });
    }
  } catch (error) {
    console.warn('滚动失败:', error);
  }
};

// 监听内容变化
watch(() => groupedMetaList.value, () => {
  checkScrollable();
}, { deep: true });

// 监听模态框显示状态
watch(visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      checkScrollable();
    });
  }
});

// 监听参数变化，重新检测滚动
watch(() => props.photo, () => {
  if (visible.value) {
    nextTick(() => {
      checkScrollable();
    });
  }
});
</script>

<template>
  <teleport to="body">
    <div v-if="isAnimating" class="modal" :class="{ 'is-visible': visible }">
      <div
        class="modal__backdrop"
        :class="{ 'is-visible': backdropVisible }"
        @click="handleClose"
      />
      <div
        class="modal__panel"
        :class="{ 'is-visible': panelVisible }"
      >
        <button class="modal__close" @click="handleClose" aria-label="关闭">
          ✕
        </button>
        <div class="modal__media">
          <div v-if="imageLoading" class="image-loading">
            <div class="loading-spinner"></div>
            <p>正在加载图片...</p>
          </div>
          <img
            v-show="!imageLoading"
            :src="imageUrl"
            :alt="photo?.title || photo?.originalName"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>
        <div class="modal__body">
          <div class="modal__head">
            <div>
              <p class="modal__eyebrow">FEATURED SHOT</p>
              <h2>{{ photo?.title || '未命名作品' }}</h2>
            </div>
            <StarRating :model-value="Number(photo?.rating) || 0" :max="7" />
          </div>
          <p class="modal__desc">{{ photo?.description || '暂无描述' }}</p>
          <div class="modal__meta-groups">
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
          <!-- 滚动指示器 -->
          <button
            v-show="hasScrollbar"
            class="scroll-indicator"
            @click="scrollToNext"
            title="向下滚动查看更多"
          >
            ⬇
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>