<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../api/http';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const form = ref({
  title: '',
  description: '',
  camera: '',
  lens: '',
  location: '',
  aperture: '',
  iso: '',
  exposureTime: '',
  focalLength: '',
  takenAt: ''
});

const file = ref(null);
const fileInput = ref(null);
const previewUrl = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

// 检查权限
const hasPermission = computed(() => {
  return authStore.isLoggedIn || userStore.isLoggedIn;
});

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
    error.value = '请选择图片文件';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const formData = new FormData();
    formData.append('photo', file.value);
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('camera', form.value.camera);
    formData.append('lens', form.value.lens);
    formData.append('location', form.value.location);

    const response = await http.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    success.value = true;

    // 重置表单
    form.value = {
      title: '',
      description: '',
      camera: '',
      lens: '',
      location: '',
      aperture: '',
      iso: '',
      exposureTime: '',
      focalLength: '',
      takenAt: ''
    };
    file.value = null;
    previewUrl.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    // 跳转到主页
    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (err) {
    error.value = err.response?.data?.message || '上传失败，请重试';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    camera: '',
    lens: '',
    location: '',
    aperture: '',
    iso: '',
    exposureTime: '',
    focalLength: '',
    takenAt: ''
  };
  file.value = null;
  previewUrl.value = '';
  error.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 页面加载时检查权限
onMounted(() => {
  if (!hasPermission.value) {
    router.push('/auth');
  }
});
</script>

<template>
  <div class="upload-page">
    <nav class="upload-nav">
      <div class="upload-nav__container">
        <div class="upload-nav__brand">
          <span class="upload-nav__logo" @click="goBack">PDCabinet</span>
        </div>
        <div class="upload-nav__actions">
          <button class="btn btn--ghost" @click="goBack">← 返回</button>
        </div>
      </div>
    </nav>

    <div class="upload-page__content">
      <div class="upload-container">
        <div class="upload-header">
          <h1>上传作品</h1>
          <p>分享您的摄影作品，支持EXIF信息自动解析</p>
        </div>

        <div v-if="!hasPermission" class="permission-denied">
          <h2>需要登录</h2>
          <p>请先登录后再上传作品</p>
          <button class="btn btn--primary" @click="goBack">返回登录</button>
        </div>

        <div v-else class="upload-form-container">
          <form @submit.prevent="handleUpload" class="upload-form">
            <!-- 文件选择区域 -->
            <div class="file-upload-area">
              <div v-if="!previewUrl" class="file-upload-placeholder">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="file-input"
                  id="photo-upload"
                />
                <label for="photo-upload" class="file-upload-label">
                  <div class="upload-icon">📷</div>
                  <p>点击选择图片或拖拽到此处</p>
                  <p class="file-hint">支持 JPG、PNG、GIF 格式，最大 50MB</p>
                </label>
              </div>

              <div v-else class="file-preview">
                <img :src="previewUrl" alt="预览" />
                <button type="button" class="remove-file" @click="resetForm" title="重新选择">
                  ✕
                </button>
              </div>
            </div>

            <!-- 表单字段 -->
            <div class="form-fields">
              <div class="form-group">
                <label for="title">作品标题</label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  placeholder="给作品起个标题"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="description">作品描述</label>
                <textarea
                  id="description"
                  v-model="form.description"
                  placeholder="描述一下这张作品"
                  rows="3"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="camera">相机</label>
                  <input
                    id="camera"
                    v-model="form.camera"
                    type="text"
                    placeholder="相机型号"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="lens">镜头</label>
                  <input
                    id="lens"
                    v-model="form.lens"
                    type="text"
                    placeholder="镜头型号"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="location">拍摄地点</label>
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  placeholder="拍摄地点"
                  class="form-input"
                />
              </div>

              <!-- 拍摄参数 -->
              <div class="form-section">
                <h3>拍摄参数</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label for="aperture">光圈值</label>
                    <input
                      id="aperture"
                      v-model="form.aperture"
                      type="text"
                      placeholder="如: f/2.8"
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label for="iso">ISO</label>
                    <input
                      id="iso"
                      v-model="form.iso"
                      type="number"
                      placeholder="如: 100"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="exposureTime">曝光时间</label>
                    <input
                      id="exposureTime"
                      v-model="form.exposureTime"
                      type="text"
                      placeholder="如: 1/60s"
                      class="form-input"
                    />
                  </div>

                  <div class="form-group">
                    <label for="focalLength">焦距</label>
                    <input
                      id="focalLength"
                      v-model="form.focalLength"
                      type="text"
                      placeholder="如: 50mm"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="takenAt">拍摄时间</label>
                  <input
                    id="takenAt"
                    v-model="form.takenAt"
                    type="datetime-local"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- 错误和成功提示 -->
            <div v-if="error" class="alert alert--error">{{ error }}</div>
            <div v-if="success" class="alert alert--success">
              上传成功！正在跳转到主页...
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn--primary"
                :disabled="!file || loading"
              >
                {{ loading ? '上传中...' : '上传作品' }}
              </button>
              <button
                type="button"
                class="btn btn--ghost"
                @click="resetForm"
                :disabled="loading"
              >
                重置
              </button>
            </div>
          </form>
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
.upload-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 15% 30%, rgba(255, 78, 162, 0.15), transparent 60%),
    radial-gradient(circle at 85% 20%, rgba(101, 132, 255, 0.15), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(255, 103, 146, 0.1), transparent 70%),
    linear-gradient(135deg, #03050b 0%, #0a0c1a 50%, #070914 100%);
}

.upload-nav {
  background: rgba(5, 8, 20, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.upload-nav__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-nav__logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(120deg, #ff6792, #715aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.upload-nav__logo:hover {
  opacity: 0.8;
}

.upload-page__content {
  flex: 1;
  padding: 2rem 0;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.upload-header {
  text-align: center;
  margin-bottom: 3rem;
}

.upload-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(120deg, #ff6792, #715aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.permission-denied {
  text-align: center;
  padding: 3rem;
  background: rgba(5, 8, 20, 0.5);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.permission-denied h2 {
  color: #ff6792;
  margin-bottom: 1rem;
}

.permission-denied p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

.upload-form {
  background: rgba(5, 8, 20, 0.5);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.file-upload-area {
  margin-bottom: 2rem;
}

.file-upload-placeholder {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.file-upload-placeholder:hover {
  border-color: rgba(255, 103, 146, 0.5);
  background: rgba(255, 103, 146, 0.05);
}

.file-input {
  display: none;
}

.file-upload-label {
  display: block;
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.file-upload-placeholder p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.file-hint {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.file-preview {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  max-height: 400px;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-file {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-file:hover {
  background: rgba(255, 0, 0, 0.7);
  transform: scale(1.1);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff6792;
  background: rgba(255, 255, 255, 0.08);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h3 {
  color: white;
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert--error {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
}

.alert--success {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  color: #51cf66;
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

@media (max-width: 768px) {
  .upload-container {
    padding: 0 1rem;
  }

  .upload-header h1 {
    font-size: 2rem;
  }

  .upload-form {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .site-footer {
    padding: 1.5rem 0;
  }

  .footer-content {
    padding: 0 1rem;
  }
}
</style>