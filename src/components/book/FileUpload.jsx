import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import supabase from '../../config/supabase';
import TextExtractor from './TextExtractor';

function FileUpload({ onUploadComplete, onUploadError }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select File, 2: Extract Content, 3: Add Details

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setCurrentStep(2);
    setUploadProgress(20);

    try {
      // Upload file to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('books')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(50);

      // Extract content from the uploaded file
      const extractedContent = await TextExtractor.extractText(file);
      
      setUploadProgress(80);

      // Get file metadata
      const { data: fileData } = await supabase.storage
        .from('books')
        .createSignedUrl(fileName, 60 * 60 * 24); // 24 hour expiry

      const bookData = {
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: uploadData.path,
        fileUrl: fileData?.signedUrl,
        extractedContent: extractedContent,
        title: extractedContent?.title || file.name.replace(/\.[^/.]+$/, ""),
        author: extractedContent?.author || 'Unknown Author',
        totalPages: extractedContent?.pageCount || 0,
        uploadedAt: new Date().toISOString()
      };

      setExtractedData(bookData);
      setUploadProgress(100);
      setCurrentStep(3);

      if (onUploadComplete) {
        onUploadComplete(bookData);
      }

    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error.message);
      }
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub'],
      'text/plain': ['.txt'],
      'application/x-mobipocket-ebook': ['.mobi']
    },
    multiple: false,
    disabled: isUploading
  });

  if (currentStep === 2) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Your Book</h3>
        <p className="text-gray-600 mb-4">Extracting content and analyzing structure...</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
      </div>
    );
  }

  if (currentStep === 3 && extractedData) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Extracted Successfully!</h3>
        <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
          <p><strong>Title:</strong> {extractedData.title}</p>
          <p><strong>Author:</strong> {extractedData.author}</p>
          <p><strong>Pages:</strong> {extractedData.totalPages}</p>
          <p><strong>File Size:</strong> {(extractedData.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
        <p className="text-gray-600">You can now add additional details and save your book.</p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      </div>
      
      {isDragActive ? (
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-2">Drop your book here!</h3>
          <p className="text-gray-600">Release to upload your book</p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isUploading ? 'Uploading...' : 'Choose a book file'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your book file here, or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, EPUB, TXT, and MOBI files up to 50MB
          </p>
        </div>
      )}
    </div>
  );
}

export default FileUpload; 