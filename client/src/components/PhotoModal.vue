<script setup>
import { computed } from 'vue';
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
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="modal">
      <div class="modal__backdrop" @click="emit('close')" />
      <div class="modal__panel">
        <button class="modal__close" @click="emit('close')" aria-label="关闭">
          ×
        </button>
        <div class="modal__media">
          <img :src="imageUrl" :alt="photo?.title || photo?.originalName" />
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
          <dl class="modal__meta">
            <template v-for="item in metaList" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </template>
          </dl>
        </div>
      </div>
    </div>
  </teleport>
</template>

