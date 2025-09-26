import { Router, Request, Response } from 'express';
import { uploadToS3, deleteFromS3, testS3Connection } from '../services/s3Service';
import { authenticate } from '../middleware/auth';

const router = Router();

// Health check endpoint to test AWS S3 connectivity (no auth required)
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test S3 connectivity
    await testS3Connection();
    
    res.json({
      status: 'healthy',
      message: 'S3 connection successful',
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ S3 health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      code: error.code,
    });
  }
});

// Test upload endpoint without authentication (for debugging)
router.post('/test-image', (req: Request, res: Response) => {
  uploadToS3.single('image')(req, res, (error) => {
    if (error) {
      console.error('❌ Test upload error:', error);
      return res.status(500).json({ 
        error: 'Upload failed', 
        details: error.message,
        code: error.code 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file as Express.MulterS3.File;
      
      console.log('✅ Test image uploaded successfully:', file.key);
      
      res.json({
        message: 'Test image uploaded successfully',
        imageUrl: file.location,
        key: file.key,
      });
    } catch (err) {
      console.error('❌ Test post-upload error:', err);
      res.status(500).json({ error: 'Failed to process uploaded image' });
    }
  });
});

// Upload single image
router.post('/image', authenticate, (req: Request, res: Response) => {
  uploadToS3.single('image')(req, res, (error) => {
    if (error) {
      console.error('❌ Multer/S3 upload error:', error);
      
      // Check for specific AWS errors
      if (error.message.includes('Missing AWS environment variables')) {
        return res.status(500).json({ 
          error: 'Server configuration error: AWS credentials not configured' 
        });
      }
      
      if (error.message.includes('Only image files are allowed')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large (max 5MB)' });
      }
      
      return res.status(500).json({ 
        error: 'Upload failed', 
        details: error.message 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file as Express.MulterS3.File;
      
      console.log('✅ Image uploaded successfully:', file.key);
      
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: file.location,
        key: file.key,
      });
    } catch (err) {
      console.error('❌ Post-upload error:', err);
      res.status(500).json({ error: 'Failed to process uploaded image' });
    }
  });
});

// Upload multiple images
router.post('/images', authenticate, uploadToS3.array('images', 5), (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.MulterS3.File[];
    const uploadedImages = files.map(file => ({
      imageUrl: file.location,
      key: file.key,
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete image
router.delete('/image/:key', authenticate, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ error: 'File key is required' });
    }

    await deleteFromS3(key);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;