<script setup>
import { ref, defineEmits } from 'vue';
import { http } from '../api/http';

const emit = defineEmits(['success', 'switch-to-register']);

const form = ref({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';

  if (!form.value.username || !form.value.password) {
    error.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;

  try {
    const response = await http.post('/auth/user/login', {
      username: form.value.username,
      password: form.value.password
    });

    // 检查响应数据结构
    if (response.data && response.data.token && response.data.user) {
      emit('success', response.data);
    } else {
      throw new Error('登录响应数据格式不正确');
    }
  } catch (err) {
    console.log('object :>> ', err);
    error.value = err.response?.data?.message || '登录失败，请重试';
  } finally {
    loading.value = false;
  }
};

const switchToRegister = () => {
  emit('switch-to-register');
};
</script>

<template>
  <div class="auth-form">
    <h2>用户登录</h2>

    <form @submit.prevent="handleLogin" class="auth-form__form">
      <div class="auth-form__field">
        <label>用户名</label>
        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名"
          :disabled="loading"
        />
      </div>

      <div class="auth-form__field">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :disabled="loading"
        />
      </div>

      <div v-if="error" class="auth-form__error">{{ error }}</div>

      <button type="submit" class="btn btn--primary" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <div class="auth-form__footer">
      <p>还没有账号？ <a @click="switchToRegister" href="#" class="link">立即注册</a></p>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-top: 1.5rem;
}

.auth-form h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  text-align: center;
}

.auth-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-form__field label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.auth-form__field input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-family: inherit;
  transition: all 0.2s ease;
}

.auth-form__field input:focus {
  outline: none;
  border-color: rgba(255, 103, 146, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 103, 146, 0.1);
}

.auth-form__field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-form__error {
  background: rgba(255, 123, 123, 0.1);
  border: 1px solid rgba(255, 123, 123, 0.3);
  color: #ff7b7b;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.auth-form__footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.link {
  color: #ff6792;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link:hover {
  color: #ff4d7c;
}
</style>