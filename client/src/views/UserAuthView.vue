<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { http } from '../api/http';
import UserLogin from '../components/UserLogin.vue';
import UserRegister from '../components/UserRegister.vue';

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref('login');

const handleLoginSuccess = (data) => {
  console.log('登录成功，接收到的数据:', data);

  // 登录成功后更新用户状态并跳转到主页
  userStore.token = data.token;
  userStore.user = data.user;
  localStorage.setItem('pdcabinet_user_token', data.token);
  localStorage.setItem('pdcabinet_user_info', JSON.stringify(data.user));

  // 更新 axios 默认头部
  http.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

  // 延迟跳转，确保状态更新完成
  setTimeout(() => {
    router.push('/');
  }, 100);
};

const handleRegisterSuccess = (data) => {
  // 注册成功后显示成功消息，保持在当前页面
  // 可以自动切换到登录页面
  setTimeout(() => {
    activeTab.value = 'login';
  }, 2000);
};

const switchTab = (tab) => {
  activeTab.value = tab;
  userStore.clearError();
};
</script>

<template>
  <div class="user-auth-page">
    <div class="user-auth-container">
      <div class="auth-header">
        <h1>PDCabinet</h1>
        <p>加入我们的摄影社区</p>
      </div>

      <div class="auth-tabs">
        <button
          class="btn"
          :class="{ 'is-active': activeTab === 'login' }"
          @click="switchTab('login')"
        >
          登录
        </button>
        <button
          class="btn"
          :class="{ 'is-active': activeTab === 'register' }"
          @click="switchTab('register')"
        >
          注册
        </button>
      </div>

      <div class="tab-content">
        <UserLogin
          v-if="activeTab === 'login'"
          @success="handleLoginSuccess"
          @switch-to-register="switchTab('register')"
        />
        <UserRegister
          v-if="activeTab === 'register'"
          @success="handleRegisterSuccess"
          @switch-to-login="switchTab('login')"
        />
      </div>

      <!-- 管理员登录入口已隐藏，只能通过直接输入URL访问 -->
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
</template>

<style scoped>
.user-auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 15% 30%, rgba(255, 78, 162, 0.15), transparent 60%),
    radial-gradient(circle at 85% 20%, rgba(101, 132, 255, 0.15), transparent 60%),
    radial-gradient(circle at 50% 80%, rgba(255, 103, 146, 0.1), transparent 70%),
    linear-gradient(135deg, #03050b 0%, #0a0c1a 50%, #070914 100%);
  padding: 2rem;
  position: relative;
}

.user-auth-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 78, 162, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(101, 132, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 103, 146, 0.05) 0%, transparent 50%);
  z-index: -1;
  pointer-events: none;
}

.user-auth-container {
  width: 100%;
  max-width: 600px;
  background: rgba(5, 8, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 4rem 3rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(120deg, #ff6792, #715aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.auth-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.auth-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.auth-tabs .btn {
  flex: 1;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.auth-tabs .btn.is-active {
  background: linear-gradient(120deg, #ff6792, #715aff);
  border-color: transparent;
  color: #fff;
}

.tab-content {
  animation: fadeInUp 0.3s ease-out;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.admin-link {
  color: #ff6792;
  text-decoration: none;
  transition: color 0.2s ease;
}

.admin-link:hover {
  color: #ff4d7c;
}

@media (max-width: 480px) {
  .user-auth-container {
    padding: 2rem 1.5rem;
  }
}

/* 页脚样式 */
.site-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 0;
  background: rgba(5, 8, 20, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.footer-content {
  text-align: center;
}

.footer-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
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

@media (max-width: 480px) {
  .site-footer {
    padding: 1rem 0;
  }

  .footer-content p {
    font-size: 0.75rem;
  }
}
</style>