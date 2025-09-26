import { Router, Request, Response } from 'express';
import { uploadToS3, deleteFromS3 } from '../services/s3Service';
import { authenticate } from '../middleware/auth';
import AWS from 'aws-sdk';

const router = Router();

// Health check endpoint to test AWS S3 connectivity
router.get('/health', async (req: Request, res: Response) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // Test S3 connectivity by listing bucket
    await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET! }).promise();
    
    res.json({
      status: 'healthy',
      message: 'S3 connection successful',
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
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