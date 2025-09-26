import { Router, Request, Response } from 'express';
import { uploadToS3, deleteFromS3 } from '../services/s3Service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Upload single image
router.post('/image', authenticateToken, uploadToS3.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file as Express.MulterS3.File;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: file.location,
      key: file.key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/images', authenticateToken, uploadToS3.array('images', 5), (req: Request, res: Response) => {
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
router.delete('/image/:key', authenticateToken, async (req: Request, res: Response) => {
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