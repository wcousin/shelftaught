import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import { deleteImage } from '../services/uploadService';

interface UploadedImage {
  url: string;
  key: string;
  id: string;
}

const ImageUploadExample: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string>('');

  const handleUploadSuccess = (imageUrl: string, key: string) => {
    const newImage: UploadedImage = {
      url: imageUrl,
      key: key,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    setUploadedImages(prev => [...prev, newImage]);
    setError('');
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeleteImage = async (image: UploadedImage) => {
    try {
      await deleteImage(image.key);
      setUploadedImages(prev => prev.filter(img => img.id !== image.id));
    } catch (error) {
      setError('Failed to delete image');
    }
  };

  return (
    <div className="image-upload-example">
      <h3>Upload Images</h3>
      
      {error && (
        <div className="error-message" style={{ 
          color: '#dc2626', 
          backgroundColor: '#fef2f2', 
          padding: '0.75rem', 
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h4>Single Image Upload</h4>
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4>Multiple Images Upload (max 3)</h4>
        <ImageUpload
          multiple
          maxFiles={3}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {uploadedImages.length > 0 && (
        <div>
          <h4>Uploaded Images</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            {uploadedImages.map(image => (
              <div key={image.id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                overflow: 'hidden' 
              }}>
                <img
                  src={image.url}
                  alt="Uploaded"
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    objectFit: 'cover' 
                  }}
                />
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    margin: '0 0 0.5rem 0',
                    wordBreak: 'break-all'
                  }}>
                    Key: {image.key}
                  </p>
                  <button
                    onClick={() => handleDeleteImage(image)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadExample;