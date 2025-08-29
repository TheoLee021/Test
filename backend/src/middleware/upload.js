const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// 설정 파일 로드
let config;
try {
  config = require('../../config.js');
} catch (error) {
  config = {
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024,
    UPLOAD_DIR: process.env.UPLOAD_DIR || '../uploads'
  };
}

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../../../uploads');
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(path.join(uploadDir, 'temp'));
fs.ensureDirSync(path.join(uploadDir, 'processed'));

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(uploadDir, 'temp');
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // 파일명: timestamp_original-name.ext
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    const extension = path.extname(file.originalname);
    const baseName = path.basename(originalName, extension);
    
    cb(null, `${timestamp}_${baseName}${extension}`);
  }
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer 인스턴스 생성
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 10MB
    files: 2 // 최대 2개 파일 (얼굴사진 + 헤어스타일 사진)
  },
  fileFilter: fileFilter
});

// 두 개의 이미지를 받는 미들웨어
const uploadImages = upload.fields([
  { name: 'faceImage', maxCount: 1 },
  { name: 'styleImage', maxCount: 1 }
]);

// 에러 핸들링 미들웨어
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: '파일 크기가 너무 큽니다',
        message: `최대 파일 크기: ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: '파일 개수가 너무 많습니다',
        message: '최대 2개의 파일만 업로드 가능합니다',
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: '예상하지 못한 파일 필드입니다',
        message: 'faceImage와 styleImage 필드만 허용됩니다',
        code: 'UNEXPECTED_FIELD'
      });
    }
  }
  
  // 일반 에러
  if (error.message) {
    return res.status(400).json({
      error: '파일 업로드 에러',
      message: error.message,
      code: 'UPLOAD_ERROR'
    });
  }
  
  next(error);
};

// 파일 검증 미들웨어
const validateFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      error: '파일이 업로드되지 않았습니다',
      message: 'faceImage와 styleImage 파일을 모두 업로드해주세요',
      code: 'NO_FILES'
    });
  }

  const { faceImage, styleImage } = req.files;
  
  if (!faceImage || !faceImage[0]) {
    return res.status(400).json({
      error: '얼굴 사진이 없습니다',
      message: 'faceImage 파일을 업로드해주세요',
      code: 'NO_FACE_IMAGE'
    });
  }
  
  if (!styleImage || !styleImage[0]) {
    return res.status(400).json({
      error: '헤어스타일 참고 사진이 없습니다',
      message: 'styleImage 파일을 업로드해주세요',
      code: 'NO_STYLE_IMAGE'
    });
  }

  // 파일 정보를 req에 추가
  req.uploadedFiles = {
    faceImage: faceImage[0],
    styleImage: styleImage[0]
  };

  next();
};

module.exports = {
  uploadImages,
  handleUploadError,
  validateFiles,
  uploadDir
};

