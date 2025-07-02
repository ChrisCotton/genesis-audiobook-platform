import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
//pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

class TextExtractor {
  static async extractText(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.extractFromPDF(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.extractFromTXT(file);
      } else if (fileName.endsWith('.epub')) {
        return await this.extractFromEPUB(file);
      } else {
        // Fallback: try to read as text
        return await this.extractFromTXT(file);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      return {
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: 'Unknown Author',
        content: '',
        pageCount: 0,
        chapters: [],
        error: error.message
      };
    }
  }

  static async extractFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const chapters = [];
      const pageCount = pdf.numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= Math.min(pageCount, 50); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        
        fullText += pageText + '\n\n';
        
        // Create chapter-like sections every 10 pages for demo
        if (pageNum % 10 === 1) {
          chapters.push({
            title: `Section ${Math.ceil(pageNum / 10)}`,
            startPage: pageNum,
            endPage: Math.min(pageNum + 9, pageCount),
            content: pageText.substring(0, 500) + '...'
          });
        }
      }

      // Try to extract title and author from the first page
      const firstPage = await pdf.getPage(1);
      const firstPageContent = await firstPage.getTextContent();
      const firstPageText = firstPageContent.items.map(item => item.str).join(' ');
      
      const title = this.extractTitleFromText(firstPageText) || file.name.replace(/\.[^/.]+$/, "");
      const author = this.extractAuthorFromText(firstPageText) || 'Extracted from PDF';

      return {
        title,
        author,
        content: fullText,
        pageCount,
        chapters,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  static async extractFromTXT(file) {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      // Try to extract title from first few lines
      let title = file.name.replace(/\.[^/.]+$/, "");
      let author = 'Unknown Author';
      
      // Look for title patterns in first 10 lines
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length > 5 && line.length < 100 && !line.includes('Chapter')) {
          if (i === 0 || (i === 1 && lines[0].trim().length < 5)) {
            title = line;
          }
          if (line.toLowerCase().includes('by ') && i < 5) {
            author = line.replace(/^by\s+/i, '').trim();
          }
        }
      }

      // Create simple chapters based on "Chapter" markers
      const chapters = [];
      let chapterCount = 1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toLowerCase().includes('chapter') && line.length < 50) {
          chapters.push({
            title: line || `Chapter ${chapterCount}`,
            startPage: Math.floor(i / 50) + 1, // Estimate 50 lines per page
            content: lines.slice(i, i + 100).join('\n').substring(0, 500) + '...'
          });
          chapterCount++;
        }
      }

      return {
        title,
        author,
        content: text,
        pageCount: Math.ceil(text.length / 2500), // Estimate ~2500 chars per page
        chapters: chapters.length > 0 ? chapters : [{
          title: 'Full Text',
          content: text.substring(0, 500) + '...'
        }],
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  static async extractFromEPUB(file) {
    try {
      // For EPUB files, we'll do a basic implementation
      // In a production app, you'd use a library like epub.js
      const text = await file.text();
      
      // Basic EPUB parsing - look for title and author in metadata
      const title = this.extractTitleFromText(text) || file.name.replace(/\.[^/.]+$/, "");
      const author = this.extractAuthorFromText(text) || 'Extracted from EPUB';
      
      // Simple content extraction
      const content = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      return {
        title,
        author,
        content: content.substring(0, 10000), // Limit content for demo
        pageCount: Math.ceil(content.length / 2500),
        chapters: [{
          title: 'EPUB Content',
          content: content.substring(0, 500) + '...'
        }],
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`EPUB extraction failed: ${error.message}`);
    }
  }

  static extractTitleFromText(text) {
    // Simple title extraction patterns
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines.slice(0, 10)) {
      if (line.length > 5 && line.length < 100 && !line.toLowerCase().includes('chapter')) {
        // Check if line looks like a title (not too many numbers or special chars)
        const specialCharRatio = (line.match(/[^a-zA-Z\s]/g) || []).length / line.length;
        if (specialCharRatio < 0.3) {
          return line;
        }
      }
    }
    
    return null;
  }

  static extractAuthorFromText(text) {
    // Look for author patterns
    const patterns = [
      /(?:by|author|written by)\s+([^\\n]{5,50})/i,
      /^([A-Z][a-z]+ [A-Z][a-z]+)$/m
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }
}

export default TextExtractor; 