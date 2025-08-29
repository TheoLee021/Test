const express = require('express');
const router = express.Router();
const { uploadImages, handleUploadError, validateFiles } = require('../middleware/upload');
const ImageProcessor = require('../services/image-processor');

const imageProcessor = new ImageProcessor();

/**
 * POST /api/upload
 * 파일 업로드 및 기본 이미지 처리 테스트
 */
router.post('/', uploadImages, handleUploadError, validateFiles, async (req, res) => {
  const tempFiles = [];
  
  try {
    const { faceImage, styleImage } = req.uploadedFiles;
    
    console.log('파일 업로드 받음:', {
      faceImage: faceImage.filename,
      styleImage: styleImage.filename
    });

    // 임시 파일 경로들 기록 (나중에 정리용)
    tempFiles.push(faceImage.path, styleImage.path);

    // 이미지 정보 추출
    const [faceImageInfo, styleImageInfo] = await Promise.all([
      imageProcessor.getImageInfo(faceImage.path),
      imageProcessor.getImageInfo(styleImage.path)
    ]);

    // 이미지 전처리 (Gemini용 포맷으로 변환)
    const [faceProcessed, styleProcessed] = await Promise.all([
      imageProcessor.preprocessForGemini(faceImage.path),
      imageProcessor.preprocessForGemini(styleImage.path)
    ]);

    // 썸네일 생성
    const [faceThumbnail, styleThumbnail] = await Promise.all([
      imageProcessor.createThumbnail(faceImage.path),
      imageProcessor.createThumbnail(styleImage.path)
    ]);

    // 응답 데이터
    const response = {
      success: true,
      message: '이미지 업로드 및 처리가 완료되었습니다',
      timestamp: new Date().toISOString(),
      files: {
        faceImage: {
          originalName: faceImage.originalname,
          filename: faceImage.filename,
          size: faceImage.size,
          mimetype: faceImage.mimetype,
          info: faceImageInfo,
          processedSize: faceProcessed.length,
          thumbnailSize: faceThumbnail.length
        },
        styleImage: {
          originalName: styleImage.originalname,
          filename: styleImage.filename,
          size: styleImage.size,
          mimetype: styleImage.mimetype,
          info: styleImageInfo,
          processedSize: styleProcessed.length,
          thumbnailSize: styleThumbnail.length
        }
      },
      processing: {
        faceImageProcessed: `${faceProcessed.length} bytes (1024x1024 JPEG)`,
        styleImageProcessed: `${styleProcessed.length} bytes (1024x1024 JPEG)`,
        thumbnailsGenerated: true,
        readyForGemini: true
      },
      nextSteps: [
        'Phase 3에서 Gemini API로 전송될 예정',
        '현재는 이미지 처리만 테스트 완료'
      ]
    };

    res.json(response);

  } catch (error) {
    console.error('업로드 처리 에러:', error);
    
    res.status(500).json({
      success: false,
      error: '이미지 처리 중 오류가 발생했습니다',
      message: error.message,
      timestamp: new Date().toISOString()
    });

  } finally {
    // 임시 파일 정리
    if (tempFiles.length > 0) {
      setTimeout(() => {
        imageProcessor.cleanupTempFiles(tempFiles);
      }, 5000); // 5초 후 정리 (응답 전송 후)
    }
  }
});

/**
 * GET /api/upload/test
 * 업로드 기능 테스트 정보
 */
router.get('/test', (req, res) => {
  res.json({
    message: '파일 업로드 테스트 엔드포인트',
    instructions: {
      method: 'POST',
      url: '/api/upload',
      contentType: 'multipart/form-data',
      fields: [
        {
          name: 'faceImage',
          type: 'file',
          description: '얼굴 사진 (JPEG, PNG)',
          required: true
        },
        {
          name: 'styleImage', 
          type: 'file',
          description: '헤어스타일 참고 사진 (JPEG, PNG)',
          required: true
        }
      ],
      limits: {
        fileSize: '10MB',
        fileCount: 2,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      }
    },
    examples: {
      curl: `curl -X POST http://localhost:3001/api/upload \\
  -F "faceImage=@face.jpg" \\
  -F "styleImage=@style.jpg"`,
      postman: 'Body > form-data > faceImage: [파일선택], styleImage: [파일선택]'
    }
  });
});

module.exports = router;

