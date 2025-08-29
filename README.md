# 헤어스타일 적용 웹사이트

Gemini 2.5 Flash Image AI를 활용하여 얼굴사진에 원하는 헤어스타일을 적용해주는 웹 애플리케이션입니다.

## 주요 기능

-  **이미지 업로드**: 드래그 앤 드롭으로 간편한 파일 업로드
-  **AI 헤어스타일 적용**: Gemini 2.5 Flash Image 모델 사용
-  **실시간 진행률**: 단계별 처리 상태 표시
-  **결과 다운로드**: 페이지 이동 없이 바로 다운로드
-  **반응형 디자인**: 모바일과 데스크톱 모두 지원

##  빠른 시작

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd Test
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# Gemini API 설정
GEMINI_API_KEY=your_gemini_api_key_here

# 서버 설정
PORT=3001
NODE_ENV=development

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000

# 파일 업로드 설정 (bytes)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=../uploads

# Gemini 생성 설정
GENERATION_TEMPERATURE=0.7
GENERATION_TOP_K=40
GENERATION_TOP_P=0.95
GENERATION_MAX_OUTPUT_TOKENS=8192

# CORS 설정 (쉼표로 구분하여 여러 도메인 허용 가능)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

### 3. 개발 서버 실행

```bash
# 프론트엔드와 백엔드를 동시에 실행
npm run dev
```

또는 개별 실행:

```bash
# 백엔드만 실행 (포트 3001)
npm run backend:dev

# 프론트엔드만 실행 (포트 3000)
npm run frontend:dev
```

## 📁 프로젝트 구조

```
Test/
├── frontend/                 # React TypeScript 앱
│   ├── src/
│   │   ├── App.tsx          # 메인 애플리케이션
│   │   ├── App.css          # 스타일시트
│   │   └── index.tsx        # 진입점
│   └── package.json
├── backend/                 # Express.js API 서버
│   ├── src/
│   │   ├── routes/          # API 라우트
│   │   │   ├── upload.js    # 파일 업로드
│   │   │   └── style-transfer.js # 헤어스타일 적용
│   │   ├── services/        # 비즈니스 로직
│   │   │   ├── gemini-service.js # Gemini API 연동
│   │   │   └── image-processor.js # 이미지 처리
│   │   ├── middleware/      # 미들웨어
│   │   │   └── upload.js    # Multer 설정
│   │   └── index.js         # 서버 진입점
│   ├── config.js            # 환경변수 설정
│   └── package.json
├── uploads/                 # 업로드된 파일 저장
│   ├── temp/               # 임시 파일
│   └── processed/          # 처리된 결과 이미지
├── .env                    # 환경변수 (Git 제외)
├── .gitignore
└── README.md
```

##  기술 스택

### 프론트엔드

- **React 18** + **TypeScript**
- **CSS3** (Glassmorphism 디자인)
- **Fetch API** (백엔드 통신)

### 백엔드

- **Node.js** + **Express.js**
- **Multer** (파일 업로드)
- **Sharp** (이미지 처리)
- **dotenv** (환경변수 관리)

### AI 및 외부 서비스

- **Google Gemini 2.5 Flash Image** (이미지 생성)
- **@google/genai SDK** (Gemini API 클라이언트)

## 개발 단계

- [x] **Phase 1**: 프로젝트 초기 설정 및 기본 구조
- [x] **Phase 2**: 백엔드 코어 기능 (파일 업로드 + 이미지 처리)
- [x] **Phase 3**: Gemini API 연동 및 테스트
- [x] **Phase 4**: 기본 프론트엔드 UI
- [x] **Phase 5**: 프론트-백엔드 연동
- [x] **Phase 6**: UX 개선 및 최적화

## API 엔드포인트

### 기본 정보

- `GET /` - 서버 상태 및 정보
- `GET /health` - 헬스 체크
- `GET /api` - API 정보

### 파일 업로드

- `POST /api/upload` - 이미지 파일 업로드

### 헤어스타일 적용

- `POST /api/style-transfer` - 헤어스타일 적용 (메인 기능)
- `GET /api/style-transfer/status` - Gemini API 상태 확인
- `GET /api/style-transfer/test` - API 사용법 가이드

## 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **헬스 체크**: http://localhost:3001/health
- **API 가이드**: http://localhost:3001/api/style-transfer/test

## 사용법

1. **얼굴 사진 업로드**: 스타일을 적용할 얼굴 사진을 드래그 앤 드롭 또는 클릭하여 선택
2. **헤어스타일 참고 사진 업로드**: 원하는 헤어스타일의 참고 이미지 선택
3. **헤어스타일 적용하기 버튼 클릭**: AI가 자동으로 헤어스타일을 적용
4. **실시간 진행률 확인**: 처리 단계별 진행 상황 모니터링
5. **결과 다운로드**: 생성된 이미지를 바로 다운로드

## 설정 옵션

### Gemini 생성 설정

- **temperature**: 창의성 조절 (0.0~2.0, 기본값: 0.7)
- **topK**: 다양성 제한 (1~100, 기본값: 40)
- **topP**: 누적 확률 임계값 (0.0~1.0, 기본값: 0.95)

### 파일 제한

- **지원 형식**: JPG, PNG, WebP
- **최대 크기**: 10MB
- **최소 크기**: 10KB

## 보안 고려사항

-  파일 타입 검증 (이미지 파일만 허용)
-  파일 크기 제한 (최대 10MB)
-  API 키 환경변수 관리
-  CORS 설정으로 도메인 제한
-  임시 파일 자동 정리

## 문제 해결

### 일반적인 문제들

**서버가 시작되지 않는 경우:**

```bash
# 포트가 사용 중인지 확인
lsof -i :3001
# 프로세스 종료 후 재시작
pkill -f "nodemon"
npm run backend:dev
```

**Gemini API 오류:**

- `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
- API 할당량이 초과되지 않았는지 확인

**파일 업로드 실패:**

- 파일 크기가 10MB 이하인지 확인
- 지원되는 이미지 형식(JPG, PNG, WebP)인지 확인

## 📝 라이센스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
