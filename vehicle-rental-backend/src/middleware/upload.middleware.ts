import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  }
});