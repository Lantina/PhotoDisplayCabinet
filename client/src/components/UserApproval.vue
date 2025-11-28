<script setup>
import { ref, onMounted } from 'vue';
import { http } from '../api/http';

const pendingUsers = ref([]);
const loading = ref(false);
const error = ref('');

const fetchPendingUsers = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await http.get('/auth/users/pending');
    pendingUsers.value = response.data;
  } catch (err) {
    error.value = '获取待审核用户列表失败';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const approveUser = async (userId) => {
  try {
    await http.post(`/auth/users/${userId}/approve`);
    await fetchPendingUsers();
  } catch (err) {
    alert('批准用户失败');
    console.error(err);
  }
};

const rejectUser = async (userId) => {
  if (!confirm('确定要拒绝此用户吗？')) return;

  try {
    await http.post(`/auth/users/${userId}/reject`);
    await fetchPendingUsers();
  } catch (err) {
    alert('拒绝用户失败');
    console.error(err);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchPendingUsers();
});
</script>

<template>
  <div class="user-approval">
    <div class="user-approval__header">
      <h3>用户注册审核</h3>
      <button class="btn btn--ghost" @click="fetchPendingUsers" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新列表' }}
      </button>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>

    <div v-if="loading && pendingUsers.length === 0" class="loading">
      正在加载待审核用户...
    </div>

    <div v-else-if="pendingUsers.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <p>暂无待审核的用户</p>
    </div>

    <div v-else class="user-list">
      <div v-for="user in pendingUsers" :key="user.id" class="user-item">
        <div class="user-info">
          <div class="user-username">{{ user.username }}</div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-date">申请时间：{{ formatDate(user.created_at) }}</div>
        </div>
        <div class="user-actions">
          <button class="btn btn--primary" @click="approveUser(user.id)">
            批准
          </button>
          <button class="btn btn--danger" @click="rejectUser(user.id)">
            拒绝
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-approval {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-top: 1.5rem;
}

.user-approval__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-approval__header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  transition: all 0.2s ease;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.user-info {
  flex: 1;
}

.user-username {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.user-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
}

.btn--danger {
  background: rgba(255, 99, 71, 0.1);
  border: 1px solid rgba(255, 99, 71, 0.3);
  color: #ff6347;
}

.btn--danger:hover {
  background: rgba(255, 99, 71, 0.2);
  border-color: rgba(255, 99, 71, 0.5);
  color: #ff7f50;
}

.alert {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 99, 132, 0.3);
  background: rgba(255, 99, 132, 0.1);
  color: #ff7b7b;
}
</style>