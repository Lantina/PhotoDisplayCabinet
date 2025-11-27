import { defineStore } from 'pinia';
import { http } from '../api/http';

export const usePhotoStore = defineStore('photos', {
  state: () => ({
    photos: [],
    selectedPhoto: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchPhotos() {
      this.loading = true;
      this.error = null;
      try {
        const response = await http.get('/photos');
        const data = response.data?.data || [];
        this.photos = data;
        this.selectedPhoto = null;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
      } finally {
        this.loading = false;
      }
    },
    selectPhoto(photo) {
      this.selectedPhoto = photo;
    },
    clearSelection() {
      this.selectedPhoto = null;
    },
    async uploadPhoto(formData) {
      this.loading = true;
      this.error = null;
      try {
        await http.post('/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await this.fetchPhotos();
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deletePhoto(id) {
      await http.delete(`/photos/${id}`);
      await this.fetchPhotos();
    },
  },
});

