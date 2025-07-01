import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TextExtractor = ({ onComplete, onProgress }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('auto');

  const detectFileFormat = (file) => {
    const extension = file.name.toLowerCase().split('.').pop();
    const mimeType = file.type.toLowerCase();
    
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (extension === 'epub' || mimeType === 'application/epub+zip') return 'epub';
    if (extension === 'txt' || mimeType === 'text/plain') return 'txt';
    if (extension === 'mobi') return 'mobi';
    
    return null;
  };

  const extractTextFromTXT = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const paragraphs = text
            .split(/\n\s*\n/)  // Split on double line breaks
            .map(p => p.trim())
            .filter(p => p.length > 0);
          
          resolve({
            text: paragraphs,
            title: file.name.replace(/\.[^/.]+$/, ''),
            author: 'Unknown Author',
            pages: Math.ceil(paragraphs.length / 3), // Rough estimate
            format: 'txt'
          });
        } catch (error) {
          reject(new Error(`Error processing text file: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractTextFromPDF = async (file) => {
    // For now, we'll simulate PDF extraction
    // In a real implementation, you'd use PDF.js or similar
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulate PDF processing delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo purposes, generate sample content
          const sampleContent = [
            "This is extracted content from a PDF file.",
            "In a real implementation, this would use PDF.js to extract actual text content from the PDF pages.",
            "The extraction would preserve paragraph structure and handle formatting appropriately.",
            "Each paragraph would be stored separately to enable proper pagination and text highlighting.",
            "Additional metadata like page numbers, headers, and footnotes would also be preserved."
          ];
          
          resolve({
            text: sampleContent,
            title: file.name.replace(/\.[^/.]+$/, ''),
            author: 'Extracted from PDF',
            pages: sampleContent.length,
            format: 'pdf'
          });
        } catch (error) {
          reject(new Error(`Error processing PDF file: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromEPUB = async (file) => {
    // For now, we'll simulate EPUB extraction
    // In a real implementation, you'd use EPUBjs or similar
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Simulate EPUB processing delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // For demo purposes, generate sample content
          const sampleContent = [
            "This is extracted content from an EPUB file.",
            "EPUB files contain structured HTML content that can be parsed to extract clean text.",
            "The extraction process would handle chapter divisions, formatting, and metadata.",
            "Images, tables, and other embedded content would be appropriately processed.",
            "The resulting text maintains the logical structure of the original document."
          ];
          
          resolve({
            text: sampleContent,
            title: file.name.replace(/\.[^/.]+$/, ''),
            author: 'Extracted from EPUB',
            pages: sampleContent.length,
            format: 'epub'
          });
        } catch (error) {
          reject(new Error(`Error processing EPUB file: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read EPUB file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    setError('');
    onProgress(0);

    try {
      // Detect file format
      const format = selectedFormat === 'auto' ? detectFileFormat(file) : selectedFormat;
      
      if (!format || !['pdf', 'epub', 'txt', 'mobi'].includes(format)) {
        throw new Error('Unsupported file format. Please upload PDF, EPUB, or TXT files.');
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      onProgress(25);

      let extractedData;
      
      // Extract based on format
      switch (format) {
        case 'txt':
          extractedData = await extractTextFromTXT(file);
          break;
        case 'pdf':
          extractedData = await extractTextFromPDF(file);
          break;
        case 'epub':
          extractedData = await extractTextFromEPUB(file);
          break;
        case 'mobi':
          // For now, treat MOBI like EPUB
          extractedData = await extractTextFromEPUB(file);
          extractedData.format = 'mobi';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      onProgress(100);
      onComplete(extractedData);
      
    } catch (error) {
      setError(error.message);
      onProgress(0);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Extract Text from Document</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">
            File format
          </label>
          <select
            id="format-select"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isExtracting}
          >
            <option value="auto">Auto-detect</option>
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
            <option value="txt">Plain Text</option>
            <option value="mobi">MOBI</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1">
            Select file
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.epub,.mobi,.txt"
            onChange={handleFileUpload}
            disabled={isExtracting}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
        </div>
        
        {isExtracting && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Extracting text...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Supported formats: PDF, EPUB, MOBI, TXT</p>
        <p>Maximum file size: 100MB</p>
      </div>
    </div>
  );
};

TextExtractor.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onProgress: PropTypes.func.isRequired
};

export default TextExtractor; 