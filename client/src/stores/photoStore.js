import { defineStore } from 'pinia';
import { http } from '../api/http';

export const usePhotoStore = defineStore('photos', {
  state: () => ({
    photos: [],
    selectedPhoto: null,
    loading: false,
    error: null,
    page: 1,
    pageSize: 20,
    hasMore: true,
  }),
  actions: {
    async fetchPhotos(reset = false) {
      if (reset) {
        this.page = 1;
        this.photos = [];
        this.hasMore = true;
      }

      if (!this.hasMore) return;

      this.loading = true;
      this.error = null;
      try {
        const response = await http.get('/photos', {
          params: {
            page: this.page,
            pageSize: this.pageSize,
          },
        });
        const data = response.data?.data || [];
        const pagination = response.data?.pagination || {};

        if (reset) {
          this.photos = data;
        } else {
          this.photos = [...this.photos, ...data];
        }

        this.hasMore = pagination.totalPages ? this.page < pagination.totalPages : data.length === this.pageSize;
        this.selectedPhoto = null;

        if (data.length > 0) {
          this.page += 1;
        }
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
    async loadMore() {
      await this.fetchPhotos();
    },
    resetPagination() {
      this.page = 1;
      this.hasMore = true;
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

