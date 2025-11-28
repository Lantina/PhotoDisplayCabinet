import { createRouter, createWebHistory } from 'vue-router';

const GalleryView = () => import('../views/GalleryView.vue');
const AdminView = () => import('../views/AdminView.vue');
const UserAuthView = () => import('../views/UserAuthView.vue');
const UploadView = () => import('../views/UploadView.vue');
const PhotoDetailView = () => import('../views/PhotoDetailView.vue');

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
    {
      path: '/auth',
      name: 'user-auth',
      component: UserAuthView,
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
    },
    {
      path: '/photo/:id',
      name: 'photo-detail',
      component: PhotoDetailView,
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;

