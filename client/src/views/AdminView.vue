<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import UploadForm from '../components/UploadForm.vue';
import AdminLogin from '../components/AdminLogin.vue';
import UserApproval from '../components/UserApproval.vue';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref('upload');

const handleSuccess = () => {
  // 登录成功后会自动显示上传表单
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="admin-page">
    <div class="admin-page__wrap">
      <div class="admin-header">
        <div class="admin-header__content">
          <p class="admin-page__eyebrow">RESTRICTED AREA</p>
          <h1>PDCabinet 管理入口</h1>
          <p>仅持有此 URL 的管理员可访问，公众页面不会暴露入口。</p>
        </div>
        <button class="btn btn--ghost admin-home-btn" @click="goToHome">
          🏠 返回主页
        </button>
      </div>

      <div class="admin-card">
        <template v-if="authStore.isLoggedIn">
          <header class="admin-card__header">
            <div>
              <p class="admin-card__label">当前管理员</p>
              <p class="admin-card__value">{{ authStore.admin?.username }}</p>
            </div>
            <button class="btn btn--ghost" @click="authStore.logout()">退出登录</button>
          </header>

          <div class="admin-tabs">
            <button
              class="btn btn--ghost"
              :class="{ 'is-active': activeTab === 'upload' }"
              @click="activeTab = 'upload'"
            >
              上传管理
            </button>
            <button
              class="btn btn--ghost"
              :class="{ 'is-active': activeTab === 'users' }"
              @click="activeTab = 'users'"
            >
              用户审核
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'upload'">
              <UploadForm />
            </div>
            <div v-if="activeTab === 'users'">
              <UserApproval />
            </div>
          </div>
        </template>
        <template v-else>
          <AdminLogin @success="handleSuccess" />
        </template>
      </div>
    </div>
  </div>
</template>

