import { S3Client, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
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

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
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
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET!,
    // Removed ACL setting - bucket policy handles public access
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
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

// Function to test S3 connectivity
export const testS3Connection = async (): Promise<void> => {
  const command = new HeadBucketCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error testing S3 connection:', error);
    throw error;
  }
};