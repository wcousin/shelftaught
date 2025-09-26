import { apiRequest } from './api';

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

  const response = await apiRequest<{ imageUrl: string; key: string }>('/upload/image', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - let browser set it with boundary for FormData
    headers: {},
  });

  return {
    imageUrl: response.imageUrl,
    key: response.key,
  };
};

export const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await apiRequest<MultipleUploadResult>('/upload/images', {
    method: 'POST',
    body: formData,
    headers: {},
  });

  return response.images;
};

export const deleteImage = async (key: string): Promise<void> => {
  await apiRequest(`/upload/image/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });
};