<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const emit = defineEmits(['success']);

const authStore = useAuthStore();
const form = ref({
  username: '',
  password: '',
});

const onSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    authStore.error = '请输入完整的管理员账号';
    return;
  }
  await authStore.login(form.value);
  emit('success');
};
</script>

<template>
  <section class="admin-login">
    <div class="admin-login__head">
      <p class="admin-login__eyebrow">ADMIN ACCESS</p>
      <h3>管理员登录</h3>
      <p>登录后可上传新作品、维护元数据。</p>
    </div>

    <form class="admin-login__form" @submit.prevent="onSubmit">
      <label>
        <span>用户名</span>
        <input
          v-model="form.username"
          type="text"
          placeholder="admin"
          autocomplete="username"
        />
      </label>
      <label>
        <span>密码</span>
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••"
          autocomplete="current-password"
        />
      </label>
      <button class="btn btn--primary" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="authStore.error" class="admin-login__error">{{ authStore.error }}</p>
    </form>
  </section>
</template>

