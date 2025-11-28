<script setup>
import { ref } from 'vue';
import { http } from '../api/http';

const emit = defineEmits(['success', 'switch-to-login']);

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleRegister = async () => {
  error.value = '';

  if (!form.value.username || !form.value.email || !form.value.password) {
    error.value = '请填写完整的注册信息';
    return;
  }

  if (form.value.username.length < 3) {
    error.value = '用户名至少需要3个字符';
    return;
  }

  if (form.value.password.length < 6) {
    error.value = '密码至少需要6个字符';
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    error.value = '请输入有效的邮箱地址';
    return;
  }

  loading.value = true;

  try {
    const response = await http.post('/auth/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    });

    success.value = true;
    emit('success', response.data);
  } catch (err) {
    error.value = err.response?.data?.message || '注册失败，请重试';
  } finally {
    loading.value = false;
  }
};

const switchToLogin = () => {
  emit('switch-to-login');
};
</script>

<template>
  <div class="auth-form">
    <h2>用户注册</h2>

    <div v-if="success" class="success-message">
      <div class="success-icon">✓</div>
      <div>
        <h4>注册成功！</h4>
        <p>请等待管理员审核，审核通过后即可登录。</p>
      </div>
    </div>

    <form v-else @submit.prevent="handleRegister" class="auth-form__form">
      <div class="auth-form__field">
        <label>用户名</label>
        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名（至少3个字符）"
          :disabled="loading"
        />
      </div>

      <div class="auth-form__field">
        <label>邮箱地址</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱地址"
          :disabled="loading"
        />
      </div>

      <div class="auth-form__field">
        <label>密码</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码（至少6个字符）"
          :disabled="loading"
        />
      </div>

      <div class="auth-form__field">
        <label>确认密码</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          :disabled="loading"
        />
      </div>

      <div v-if="error" class="auth-form__error">{{ error }}</div>

      <button type="submit" class="btn btn--primary" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>

    <div class="auth-form__footer">
      <p>已有账号？ <a @click="switchToLogin" href="#" class="link">立即登录</a></p>
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

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
}

.success-icon {
  width: 2rem;
  height: 2rem;
  background: rgba(74, 222, 128, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.success-message h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.success-message p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
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