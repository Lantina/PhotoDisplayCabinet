import { defineStore } from 'pinia';
import { http } from '../api/http';

const USER_TOKEN_KEY = 'pdcabinet_user_token';
const USER_INFO_KEY = 'pdcabinet_user_info';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(USER_TOKEN_KEY) || '',
    user: localStorage.getItem(USER_INFO_KEY)
      ? JSON.parse(localStorage.getItem(USER_INFO_KEY))
      : null,
    error: null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isUser: (state) => !!state.token && !state.user?.isAdmin,
  },
  actions: {
    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await http.post('/auth/user/login', payload);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem(USER_TOKEN_KEY, this.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(this.user));

        http.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await http.post('/auth/register', payload);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      delete http.defaults.headers.common['Authorization'];
    },

    clearError() {
      this.error = null;
    }
  },
});