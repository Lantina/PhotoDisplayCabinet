import { createRouter, createWebHistory } from 'vue-router';

const GalleryView = () => import('../views/GalleryView.vue');
const AdminView = () => import('../views/AdminView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'gallery',
      component: GalleryView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;

