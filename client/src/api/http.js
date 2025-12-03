import axios from 'axios';

const apiBase = (
  import.meta.env.VITE_API_BASE || 'https://pdcabinetapi.pixris.online/api'
).replace(/\/$/, '');

const assetBase = (
  import.meta.env.VITE_ASSET_BASE || apiBase.replace(/\/api$/, '')
).replace(/\/$/, '');

export const http = axios.create({
  baseURL: apiBase,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('pdcabinet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const buildImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${assetBase}${normalized}`;
};

