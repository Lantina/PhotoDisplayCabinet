<script setup>
import { ref } from 'vue';
import { http } from '../api/http';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const emit = defineEmits(['success', 'close']);

const form = ref({
  title: '',
  description: '',
  camera: '',
  lens: '',
  location: ''
});

const file = ref(null);
const fileInput = ref(null);
const previewUrl = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleFileSelect = (event) => {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  if (!selectedFile.type.startsWith('image/')) {
    error.value = '请选择图片文件';
    return;
  }

  if (selectedFile.size > 50 * 1024 * 1024) {
    error.value = '文件大小不能超过50MB';
    return;
  }

  file.value = selectedFile;
  error.value = '';

  // 生成预览
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(selectedFile);
};

const handleUpload = async () => {
  if (!file.value) {
    error.value = '请选择照片文件';
    return;
  }

  loading.value = true;
  error.value = '';

  const formData = new FormData();
  formData.append('photo', file.value);
  formData.append('title', form.value.title);
  formData.append('description', form.value.description);
  formData.append('camera', form.value.camera);
  formData.append('lens', form.value.lens);
  formData.append('location', form.value.location);

  try {
    const response = await http.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    success.value = true;
    emit('success', response.data);

    // 重置表单
    setTimeout(() => {
      resetForm();
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.message || '上传失败，请重试';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    camera: '',
    lens: '',
    location: ''
  };
  file.value = null;
  previewUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  success.value = false;
  error.value = '';
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div class="user-upload-modal">
    <div class="upload-modal__content">
      <div class="upload-modal__header">
        <h3>上传照片</h3>
        <button class="modal__close" @click="closeModal" aria-label="关闭">✕</button>
      </div>

      <div v-if="success" class="success-message">
        <div class="success-icon">✓</div>
        <div>
          <h4>上传成功！</h4>
          <p>您的照片已成功上传。</p>
        </div>
      </div>

      <form v-else @submit.prevent="handleUpload" class="upload-form">
        <div class="upload-section">
          <div class="file-upload-area"
            @click="fileInput?.click()"
            :class="{ 'has-file': file }"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
            />
            <div v-if="!file" class="upload-prompt">
              <div class="upload-icon">📷</div>
              <p>点击选择照片或拖拽到此处</p>
              <p class="upload-hint">支持 JPG、PNG、GIF 格式，最大 50MB</p>
            </div>
            <div v-else class="file-preview">
              <img :src="previewUrl" alt="预览" />
              <div class="file-info">
                <p>{{ file.name }}</p>
                <p class="file-size">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-row">
            <div class="form-field">
              <label>标题</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="给照片起个标题（可选）"
                :disabled="loading"
              />
            </div>
            <div class="form-field">
              <label>地点</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="拍摄地点（可选）"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-field">
            <label>描述</label>
            <textarea
              v-model="form.description"
              placeholder="描述这张照片（可选）"
              rows="3"
              :disabled="loading"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>相机</label>
              <input
                v-model="form.camera"
                type="text"
                placeholder="相机型号（可选）"
                :disabled="loading"
              />
            </div>
            <div class="form-field">
              <label>镜头</label>
              <input
                v-model="form.lens"
                type="text"
                placeholder="镜头型号（可选）"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-actions">
          <button type="button" class="btn btn--ghost" @click="closeModal" :disabled="loading">
            取消
          </button>
          <button type="submit" class="btn btn--primary" :disabled="loading || !file">
            {{ loading ? '上传中...' : '上传照片' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.user-upload-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.upload-modal__content {
  background: linear-gradient(135deg, #0f071a 0%, #1a0b2e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  width: min(600px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: scaleIn 0.3s ease-out;
}

.upload-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.upload-modal__header h3 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(120deg, #ff6792, #715aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.upload-section {
  position: relative;
}

.file-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.file-upload-area:hover {
  border-color: rgba(255, 103, 146, 0.5);
  background: rgba(255, 255, 255, 0.02);
}

.file-upload-area.has-file {
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(74, 222, 128, 0.05);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.upload-prompt p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.upload-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.file-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.file-info p {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.file-size {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: rgba(255, 103, 146, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 103, 146, 0.1);
}

.form-field input:disabled,
.form-field textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  padding: 1.5rem;
  margin: 2rem;
  border-radius: 1rem;
}

.success-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(74, 222, 128, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.success-message h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.success-message p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.error-message {
  background: rgba(255, 123, 123, 0.1);
  border: 1px solid rgba(255, 123, 123, 0.3);
  color: #ff7b7b;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .upload-modal__content {
    margin: 1rem;
  }

  .upload-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .file-upload-area {
    padding: 2rem 1.5rem;
  }
}
</style>