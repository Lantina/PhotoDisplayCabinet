<script setup>
import { reactive, ref } from 'vue';
import * as exifr from 'exifr';
import { usePhotoStore } from '../stores/photoStore';
import StarRating from './StarRating.vue';

// 添加成功提示状态
const showSuccess = ref(false);

const photoStore = usePhotoStore();

const form = reactive({
  title: '',
  description: '',
  rating: 0,
  manufacturer: '',
  model: '',
  takenAt: '',
  exposureTime: '',
  aperture: '',
  iso: '',
  modifiedAt: '',
  focalLength: '',
  camera: '',
  lens: '',
});

const preview = ref('');
const fileInput = ref(null);
const extracting = ref(false);

const resetForm = () => {
  Object.keys(form).forEach((key) => {
    form[key] = '';
  });
  form.rating = 0;
  preview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const hydrateFromExif = async (file) => {
  extracting.value = true;
  try {
    const data = await exifr.parse(file, {
      extract: [
        'Make',
        'Model',
        'DateTimeOriginal',
        'ModifyDate',
        'ExposureTime',
        'FNumber',
        'ISO',
        'FocalLength',
        'LensModel',
      ]
    });
    if (!data) return;
    form.manufacturer = data.Make || form.manufacturer;
    form.model = data.Model || form.model;
    form.camera = data.Model || form.camera;
    form.lens = data.LensModel || form.lens;
    form.takenAt = formatDateInput(data.DateTimeOriginal) || form.takenAt;
    form.modifiedAt = formatDateInput(data.ModifyDate) || form.modifiedAt;
    form.exposureTime = data.ExposureTime
      ? typeof data.ExposureTime === 'number'
        ? data.ExposureTime >= 1
          ? `${data.ExposureTime}s`
          : `1/${Math.round(1 / data.ExposureTime)}`
        : `${data.ExposureTime}`
      : form.exposureTime;
    form.aperture = data.FNumber
      ? `f/${Number(data.FNumber).toFixed(1).replace(/\.0$/, '')}`
      : form.aperture;
    form.iso = data.ISO ? String(data.ISO) : form.iso;
    form.focalLength = data.FocalLength
      ? `${Number(data.FocalLength).toFixed(1).replace(/\.0$/, '')}mm`
      : form.focalLength;
  } catch (error) {
    console.warn('[EXIF] 解析失败', error);
  } finally {
    extracting.value = false;
  }
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    preview.value = '';
    return;
  }

  if (!file.type.startsWith('image/')) {
    photoStore.error = '请选择图片文件';
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    photoStore.error = '文件大小不能超过20MB';
    return;
  }

  preview.value = URL.createObjectURL(file);
  photoStore.error = '';
  await hydrateFromExif(file);
};

const submit = async () => {
  const file = fileInput.value?.files?.[0];
  if (!file) {
    photoStore.error = '请选择图片文件';
    return;
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    // 特别处理rating字段，允许0值
    if (key === 'rating' || value) {
      formData.append(key, String(value));
    }
  });
  formData.append('photo', file);

  try {
    await photoStore.uploadPhoto(formData);
    // 显示成功提示
    showSuccess.value = true;
    // 3秒后开始淡出动画
    setTimeout(() => {
      const toast = document.querySelector('.success-toast');
      if (toast) {
        toast.style.animation = 'slideInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), fadeOut 0.5s ease-in-out forwards';
      }
    }, 2500);
    // 3.5秒后完全隐藏
    setTimeout(() => {
      showSuccess.value = false;
    }, 3500);
    resetForm();
  } catch (error) {
    // 错误处理已在store中处理
    console.error('上传失败:', error);
  }
};
</script>

<template>
  <form class="upload-form" @submit.prevent="submit">
  <!-- 成功提示 -->
  <div v-if="showSuccess" class="success-toast">
    <div class="success-icon">✓</div>
    <div class="success-content">
      <h4>上传成功！</h4>
      <p>您的作品已成功发布到画廊</p>
    </div>
  </div>
    <div class="upload-form__field">
      <label>作品标题</label>
      <input v-model="form.title" type="text" placeholder="作品名称" />
    </div>
    <div class="upload-form__field">
      <label>作品描述</label>
      <textarea v-model="form.description" rows="3" placeholder="创作理念、布光、色调..."></textarea>
    </div>

    <div class="upload-form__field">
      <label>作品封面</label>
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
      <p v-if="extracting" class="upload-form__hint">读取 EXIF 中...</p>
      <img v-if="preview" class="upload-form__preview" :src="preview" alt="预览" />
    </div>

    <div class="upload-form__field">
      <label>拍摄评价（最多七星）</label>
      <StarRating v-model="form.rating" :max="7" editable />
    </div>

    <div class="upload-grid">
      <label>
        <span>制造商</span>
        <input v-model="form.manufacturer" type="text" />
      </label>
      <label>
        <span>相机型号</span>
        <input v-model="form.model" type="text" />
      </label>
      <label>
        <span>拍摄时间</span>
        <input v-model="form.takenAt" type="datetime-local" />
      </label>
      <label>
        <span>曝光时间</span>
        <input v-model="form.exposureTime" type="text" placeholder="1/200" />
      </label>
      <label>
        <span>光圈值</span>
        <input v-model="form.aperture" type="text" placeholder="f/2.8" />
      </label>
      <label>
        <span>ISO 速度</span>
        <input v-model="form.iso" type="text" placeholder="100" />
      </label>
      <label>
        <span>修改时间</span>
        <input v-model="form.modifiedAt" type="datetime-local" />
      </label>
      <label>
        <span>焦距</span>
        <input v-model="form.focalLength" type="text" placeholder="35mm" />
      </label>
      <label>
        <span>镜头</span>
        <input v-model="form.lens" type="text" placeholder="可选" />
      </label>
      <label>
        <span>自定义相机</span>
        <input v-model="form.camera" type="text" placeholder="可选" />
      </label>
    </div>

    <button class="btn btn--primary" type="submit" :disabled="photoStore.loading">
      {{ photoStore.loading ? '上传中...' : '发布作品' }}
    </button>
    <p v-if="photoStore.error" class="upload-form__error">{{ photoStore.error }}</p>
  </form>
</template>

