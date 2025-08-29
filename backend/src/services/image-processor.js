const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

class ImageProcessor {
  constructor() {
    this.processedDir = path.join(__dirname, '../../../uploads/processed');
    fs.ensureDirSync(this.processedDir);
  }

  /**
   * Gemini API용 이미지 전처리
   */
  async preprocessForGemini(imagePath) {
    try {
      console.log(`이미지 전처리: ${imagePath}`);
      
      // 1024x1024 JPEG로 변환
      const buffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      console.log(`전처리 완료: ${buffer.length} bytes`);
      return buffer;

    } catch (error) {
      console.error('전처리 에러:', error);
      throw new Error(`이미지 전처리 실패: ${error.message}`);
    }
  }

  /**
   * 결과 이미지 저장
   */
  async postprocessResult(imageBuffer, filename) {
    try {
      const outputPath = path.join(this.processedDir, filename);
      
      await sharp(imageBuffer)
        .png({ quality: 95 })
        .toFile(outputPath);
      
      console.log(`결과 이미지 저장: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('후처리 에러:', error);
      throw new Error(`이미지 저장 실패: ${error.message}`);
    }
  }

  /**
   * 임시 파일 정리
   */
  async cleanupTempFiles(filePaths) {
    try {
      for (const filePath of filePaths) {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
          console.log(`임시 파일 삭제: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('파일 정리 에러:', error);
    }
  }
}

module.exports = ImageProcessor;