const { GoogleGenAI } = require('@google/genai');

// 설정 파일 로드
let config;
try {
  config = require('../../config.js');
} catch (error) {
  config = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
  };
}

class GeminiService {
  constructor() {
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API 키가 설정되지 않았습니다');
    }
    
    this.ai = new GoogleGenAI({
      apiKey: config.GEMINI_API_KEY
    });
    console.log('✅ Gemini 서비스 초기화 완료');
  }

  /**
   * 헤어스타일 적용 (이미지 생성)
   */
  async applyHairstyle(faceImageBuffer, styleImageBuffer) {
    try {
      console.log('🎨 헤어스타일 적용 시작...');
      
      const startTime = Date.now();
      
      const prompt = [
        { text: "Take the first image of the person. Add the hairstyle from the second image to the person. Ensure the person's face and features remain completely unchanged." },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: faceImageBuffer.toString('base64'),
          },
        },
        {
          inlineData: {
            mimeType: "image/jpeg", 
            data: styleImageBuffer.toString('base64'),
          },
        },
      ];

      // 새로운 Gemini 2.5 Flash Image API 호출
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
        generationConfig: config.GENERATION_CONFIG
      });
      
      const endTime = Date.now();
      console.log(`⏱️  처리 시간: ${endTime - startTime}ms`);
      
      // 응답에서 이미지 찾기
      let imageBuffer = null;
      let textResponse = null;

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          textResponse = part.text;
          console.log('📄 텍스트 응답:', part.text.substring(0, 100) + '...');
        } else if (part.inlineData) {
          const imageData = part.inlineData.data;
          imageBuffer = Buffer.from(imageData, "base64");
          console.log('🖼️ 이미지 생성됨:', imageBuffer.length, 'bytes');
        }
      }
      
      return {
        success: true,
        imageBuffer: imageBuffer,
        textResponse: textResponse,
        processingTime: endTime - startTime
      };

    } catch (error) {
      console.error('❌ 에러:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * API 상태 확인
   */
  async checkStatus() {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: "Hello",
      });
      
      const text = response.candidates[0].content.parts[0].text;
      
      return {
        status: 'healthy',
        model: 'gemini-2.5-flash-image-preview',
        testResponse: text.substring(0, 50)
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = GeminiService;