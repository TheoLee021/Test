import React, { useState } from 'react';
import './App.css';

interface UploadResult {
  success: boolean;
  message: string;
  imageUrl?: string;
  downloadUrl?: string;
  textResponse?: string;
  processingTime?: number;
}

function App() {
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (type: 'face' | 'style', file: File | null) => {
    if (type === 'face') {
      setFaceImage(file);
    } else {
      setStyleImage(file);
    }
    // 파일 변경시 이전 결과 초기화
    setResult(null);
    setError('');
  };

  const simulateProgress = () => {
    setProgress(0);
    setLoadingStep('📤 이미지 업로드 중...');
    
    setTimeout(() => {
      setProgress(25);
      setLoadingStep('🔍 이미지 분석 중...');
    }, 500);
    
    setTimeout(() => {
      setProgress(50);
      setLoadingStep('🎨 AI 헤어스타일 적용 중...');
    }, 2000);
    
    setTimeout(() => {
      setProgress(75);
      setLoadingStep('🖼️ 결과 이미지 생성 중...');
    }, 5000);
    
    setTimeout(() => {
      setProgress(90);
      setLoadingStep('✨ 최종 처리 중...');
    }, 8000);
  };

  const handleDownload = async (downloadUrl: string, filename: string = 'hairstyle_result.png') => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 임시로 DOM에 추가하고 클릭
      document.body.appendChild(link);
      link.click();
      
      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 실패:', error);
      // 실패시 기본 다운로드 방식으로 폴백
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.click();
    }
  };

  const handleSubmit = async () => {
    if (!faceImage || !styleImage) {
      setError('얼굴 사진과 헤어스타일 사진을 모두 선택해주세요');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    simulateProgress();

    try {
      console.log('API 요청 시작...');
      
      const formData = new FormData();
      formData.append('faceImage', faceImage);
      formData.append('styleImage', styleImage);
      formData.append('style', 'natural');

      console.log('FormData 준비 완료:', {
        faceImage: faceImage.name,
        styleImage: styleImage.name
      });

      const response = await fetch('http://localhost:3001/api/style-transfer', {
        method: 'POST',
        body: formData,
        // CORS를 위한 헤더는 자동으로 설정됨
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('응답 데이터:', data);
      
      setProgress(100);
      setLoadingStep('🎉 완료!');
      
      if (data.success) {
        setResult(data);
        console.log('성공! 결과:', data.message);
      } else {
        setError(data.error || data.message || '헤어스타일 적용에 실패했습니다');
      }
    } catch (err: any) {
      console.error('에러 발생:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (err.message.includes('HTTP 429')) {
        setError('API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message || '알 수 없는 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingStep('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>헤어스타일 AI</h1>
        <p>원하는 헤어스타일을 적용해보세요!</p>
      </header>

      <main className="App-main">
        {/* 파일 업로드 섹션 */}
        <div className="upload-section">
          <div className="upload-group">
            <h3>얼굴 사진</h3>
            <FileUpload 
              onFileChange={(file) => handleFileChange('face', file)}
              accept="image/*"
              currentFile={faceImage}
            />
          </div>

          <div className="upload-group">
            <h3>헤어스타일 참고 사진</h3>
            <FileUpload 
              onFileChange={(file) => handleFileChange('style', file)}
              accept="image/*"
              currentFile={styleImage}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>오류가 발생했습니다</h4>
              <p>{error}</p>
              <button 
                className="error-dismiss"
                onClick={() => setError('')}
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 실행 버튼 */}
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading || !faceImage || !styleImage}
        >
          {loading ? '🎨 헤어스타일 적용 중...' : '✨ 헤어스타일 적용하기'}
        </button>

        {/* 로딩 상태 */}
        {loading && (
          <div className="loading">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{progress}%</div>
            </div>
            <div className="loading-step">{loadingStep}</div>
            <div className="spinner"></div>
            <p className="loading-description">
              평균 처리 시간: 8-12초 | AI가 이미지를 분석하고 헤어스타일을 적용하고 있습니다
            </p>
          </div>
        )}

        {/* 결과 표시 */}
        {result && (
          <div className="result-section">
            <h3>🎉 결과</h3>
            <p className="success-message">{result.message}</p>
            
            {result.imageUrl && (
              <div className="result-display">
                <div className="result-image-container">
                  <img 
                    src={result.downloadUrl} 
                    alt="헤어스타일 적용 결과" 
                    className="result-image-main"
                  />
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="download-button primary"
                    onClick={() => handleDownload(result.downloadUrl!, 'hairstyle_result.png')}
                  >
                    📥 결과 이미지 다운로드
                  </button>
                  
                  <button 
                    className="retry-button"
                    onClick={() => {
                      setResult(null);
                      setError('');
                    }}
                  >
                    🔄 다시 시도하기
                  </button>
                </div>
              </div>
            )}

            <div className="result-details">
              {result.processingTime && (
                <p className="processing-time">
                  ⏱️ 처리 시간: {(result.processingTime / 1000).toFixed(1)}초
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 파일 업로드 컴포넌트
interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept: string;
  currentFile: File | null;
}

function FileUpload({ onFileChange, accept, currentFile }: FileUploadProps) {
  const inputId = React.useRef(`file-${Math.random()}`).current;

  const validateFile = (file: File): string | null => {
    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return '파일 크기는 10MB를 초과할 수 없습니다.';
    }

    // 파일 타입 검증 (더 엄격하게)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'JPG, PNG, WebP 파일만 업로드 가능합니다.';
    }

    // 최소 크기 검증 (10KB)
    if (file.size < 10 * 1024) {
      return '이미지 파일이 너무 작습니다. (최소 10KB)';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        // 입력 필드 초기화
        event.target.value = '';
        return;
      }
    }

    onFileChange(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      onFileChange(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="file-input"
        id={inputId}
      />
      <label 
        htmlFor={inputId} 
        className="file-label"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {currentFile ? (
          <div className="file-preview">
            <img 
              src={URL.createObjectURL(currentFile)} 
              alt="미리보기" 
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <p>{currentFile.name}</p>
            <p className="file-size">
              {(currentFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="file-placeholder">
            <span>📁 클릭하거나 드래그하여 이미지 선택</span>
            <p>최대 10MB, JPG/PNG/WebP</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default App;