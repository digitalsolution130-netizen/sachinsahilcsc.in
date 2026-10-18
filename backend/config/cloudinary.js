import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Use memory storage so we can upload buffer directly to Cloudinary or fallback
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const isConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key';

  if (!isConfigured) {
    // Graceful fallback to data URL when Cloudinary is not yet configured
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return {
      url: dataUrl,
      publicId: `local_${Date.now()}`,
      name: file.originalname,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.mimetype
    };
  }

  // Real Cloudinary upload
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'digital_solutions_docs',
        resource_type: 'auto',
        public_id: `doc_${Date.now()}`
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error, falling back:', error.message);
          const base64 = file.buffer.toString('base64');
          return resolve({
            url: `data:${file.mimetype};base64,${base64}`,
            publicId: `fallback_${Date.now()}`,
            name: file.originalname,
            size: `${Math.round(file.size / 1024)} KB`,
            type: file.mimetype
          });
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          name: file.originalname,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.mimetype
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

