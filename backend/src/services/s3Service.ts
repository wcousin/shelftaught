import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';

// Validate AWS configuration
const validateAWSConfig = () => {
  const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing AWS environment variables:', missing);
    throw new Error(`Missing AWS environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ AWS configuration validated');
  console.log('🔧 AWS Region:', process.env.AWS_REGION);
  console.log('🔧 S3 Bucket:', process.env.AWS_S3_BUCKET);
};

// Validate configuration on startup
validateAWSConfig();

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer for S3 upload
export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET!,
    acl: 'public-read',
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      cb(null, `images/${uniqueSuffix}.${fileExtension}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Function to delete file from S3
export const deleteFromS3 = async (fileKey: string): Promise<void> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Function to get signed URL for private files (if needed later)
export const getSignedUrl = (fileKey: string, expires: number = 3600): string => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
    Expires: expires,
  });
};