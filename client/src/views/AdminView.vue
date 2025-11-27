<script setup>
import { useAuthStore } from '../stores/authStore';
import UploadForm from '../components/UploadForm.vue';
import AdminLogin from '../components/AdminLogin.vue';

const authStore = useAuthStore();

const handleSuccess = () => {
  // 登录成功后会自动显示上传表单
};
</script>

<template>
  <div class="admin-page">
    <div class="admin-page__wrap">
      <p class="admin-page__eyebrow">RESTRICTED AREA</p>
      <h1>CAMARTS 管理入口</h1>
      <p>仅持有此 URL 的管理员可访问，公众页面不会暴露入口。</p>

      <div class="admin-card">
        <template v-if="authStore.isLoggedIn">
          <header class="admin-card__header">
            <div>
              <p class="admin-card__label">当前管理员</p>
              <p class="admin-card__value">{{ authStore.admin?.username }}</p>
            </div>
            <button class="btn btn--ghost" @click="authStore.logout()">退出登录</button>
          </header>
          <UploadForm />
        </template>
        <template v-else>
          <AdminLogin @success="handleSuccess" />
        </template>
      </div>
    </div>
  </div>
</template>

