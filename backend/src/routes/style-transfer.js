const express = require('express');
const router = express.Router();
const { uploadImages, handleUploadError, validateFiles } = require('../middleware/upload');
const ImageProcessor = require('../services/image-processor');
const GeminiService = require('../services/gemini-service');

const imageProcessor = new ImageProcessor();
let geminiService;

// Gemini 서비스 초기화
try {
  geminiService = new GeminiService();
} catch (error) {
  console.error('Gemini 서비스 초기화 실패:', error.message);
  geminiService = null;
}

/**
 * POST /api/style-transfer
 * 헤어스타일 적용 메인 엔드포인트
 */
router.post('/', uploadImages, handleUploadError, validateFiles, async (req, res) => {
  const tempFiles = [];
  
  try {
    if (!geminiService) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API가 초기화되지 않았습니다'
      });
    }

    const { faceImage, styleImage } = req.uploadedFiles;
    tempFiles.push(faceImage.path, styleImage.path);

    // 이미지 전처리
    const [faceProcessed, styleProcessed] = await Promise.all([
      imageProcessor.preprocessForGemini(faceImage.path),
      imageProcessor.preprocessForGemini(styleImage.path)
    ]);

    // Gemini API로 헤어스타일 적용
    const result = await geminiService.applyHairstyle(faceProcessed, styleProcessed);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: '헤어스타일 적용 실패',
        message: result.error
      });
    }

    // 결과 이미지 저장
    let imageUrl = null;
    if (result.imageBuffer) {
      const timestamp = Date.now();
      const filename = `result_${timestamp}.png`;
      const resultPath = await imageProcessor.postprocessResult(result.imageBuffer, filename);
      imageUrl = `/uploads/processed/${filename}`;
      console.log('✅ 결과 이미지 저장:', resultPath);
    }

    res.json({
      success: true,
      message: result.imageBuffer ? '헤어스타일이 적용된 이미지가 생성되었습니다' : '요청 처리 완료',
      imageUrl: imageUrl,
      downloadUrl: imageUrl ? `http://localhost:3001${imageUrl}` : null,
      textResponse: result.textResponse,
      processingTime: result.processingTime
    });

  } catch (error) {
    console.error('에러:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류',
      message: error.message
    });
  } finally {
    // 임시 파일 정리
    setTimeout(() => {
      imageProcessor.cleanupTempFiles(tempFiles);
    }, 5000);
  }
});

/**
 * GET /api/style-transfer/status
 * Gemini API 상태 확인
 */
router.get('/status', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(500).json({
        status: 'error',
        message: 'Gemini 서비스가 초기화되지 않았습니다'
      });
    }

    const result = await geminiService.checkStatus();
    res.json(result);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/style-transfer/test
 * API 사용법 가이드
 */
router.get('/test', (req, res) => {
  res.json({
    message: '헤어스타일 적용 API 테스트 가이드',
    endpoints: {
      styleTransfer: {
        method: 'POST',
        url: '/api/style-transfer',
        description: '얼굴 사진에 헤어스타일을 적용합니다',
        fields: [
          { name: 'faceImage', type: 'file', required: true, description: '얼굴 사진' },
          { name: 'styleImage', type: 'file', required: true, description: '헤어스타일 참고 사진' },
          { name: 'style', type: 'string', required: false, description: '스타일 옵션 (natural, dramatic)' }
        ]
      },
      status: {
        method: 'GET',
        url: '/api/style-transfer/status',
        description: 'Gemini API 연결 상태를 확인합니다'
      }
    }
  });
});

module.exports = router;
