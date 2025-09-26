import apiClient from './api';

export interface UploadResult {
  imageUrl: string;
  key: string;
}

export interface MultipleUploadResult {
  images: UploadResult[];
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    imageUrl: response.data.imageUrl,
    key: response.data.key,
  };
};

export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await apiClient.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.images;
};

export const deleteImage = async (key: string): Promise<void> => {
  await apiClient.delete(`/upload/image/${encodeURIComponent(key)}`);
};