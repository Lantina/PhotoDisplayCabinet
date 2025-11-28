import { defineStore } from 'pinia';
import { http } from '../api/http';

const TOKEN_KEY = 'pdcabinet_token';
const ADMIN_KEY = 'pdcabinet_admin';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    admin: localStorage.getItem(ADMIN_KEY)
      ? JSON.parse(localStorage.getItem(ADMIN_KEY))
      : null,
    error: null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await http.post('/auth/login', payload);
        this.token = response.data.token;
        this.admin = response.data.admin;
        localStorage.setItem(TOKEN_KEY, this.token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(this.admin));
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = '';
      this.admin = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    },
  },
});

