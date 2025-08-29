const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config');

// 라우트 임포트
const uploadRoute = require('./routes/upload');
const styleTransferRoute = require('./routes/style-transfer');

const app = express();

// CORS 설정
app.use(cors({
  origin: config.CORS_CONFIG.origins,
  credentials: config.CORS_CONFIG.credentials,
  methods: config.CORS_CONFIG.methods,
  allowedHeaders: config.CORS_CONFIG.allowedHeaders
}));

// JSON 파싱 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 정적 파일 서빙 (업로드된 이미지들)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(uploadsDir, 'temp');
const processedDir = path.join(uploadsDir, 'processed');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(tempDir);
fs.ensureDirSync(processedDir);

// 라우트 등록
app.use('/api/upload', uploadRoute);
app.use('/api/style-transfer', styleTransferRoute);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '🎨 헤어스타일 적용 API 서버',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      upload: '/api/upload',
      styleTransfer: '/api/style-transfer',
      apiInfo: '/api/style-transfer/test'
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV
  });
});

// API 정보 엔드포인트
app.get('/api', (req, res) => {
  res.json({
    message: '헤어스타일 적용 API',
    version: '1.0.0',
    documentation: '/api/style-transfer/test'
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로를 찾을 수 없습니다: ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api',
      'POST /api/upload',
      'POST /api/style-transfer',
      'GET /api/style-transfer/status',
      'GET /api/style-transfer/test'
    ]
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.NODE_ENV === 'development' ? err.message : '서버 내부 오류가 발생했습니다',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 서버 시작
const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  console.log('✅ Gemini 서비스 초기화 완료');
  console.log(`🚀 헤어스타일 적용 API 서버가 포트 ${PORT}에서 실행 중입니다!`);
  console.log(`📱 프론트엔드 URL: ${config.FRONTEND_URL}`);
  console.log(`🔧 환경: ${config.NODE_ENV}`);
  console.log(`📁 업로드 디렉토리: ${config.UPLOAD_DIR}`);
  console.log(`🌐 API 접속: http://localhost:${PORT}`);
  console.log(`❤️  헬스 체크: http://localhost:${PORT}/health`);
});

module.exports = app;
