import axios from 'axios';

const apiBase = (
  import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
).replace(/\/$/, '');

const assetBase = (
  import.meta.env.VITE_ASSET_BASE || apiBase.replace(/\/api$/, '')
).replace(/\/$/, '');

export const http = axios.create({
  baseURL: apiBase,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  // 优先使用管理员 token，如果没有再使用用户 token
  const adminToken = localStorage.getItem('pdcabinet_token');
  const userToken = localStorage.getItem('pdcabinet_user_token');

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export const buildImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${assetBase}${normalized}`;
};

