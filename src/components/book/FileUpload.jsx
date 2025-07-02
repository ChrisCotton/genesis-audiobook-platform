<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextExtractor from './TextExtractor';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    language: 'en',
    tags: []
  });
  const [extractedContent, setExtractedContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: file selection, 2: content extraction, 3: metadata

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }
    
    if (!extractedContent) {
      newErrors.file = 'Please select and process a file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTagsChange = (tagsString) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    handleFormChange('tags', tags);
  };

  const handleExtractionComplete = (extractedData) => {
    setExtractedContent(extractedData);
    
    // Auto-fill form data from extracted content if not already filled
    if (!formData.title && extractedData.title) {
      setFormData(prev => ({
        ...prev,
        title: extractedData.title
      }));
    }
    
    if (!formData.author && extractedData.author) {
      setFormData(prev => ({
        ...prev,
        author: extractedData.author
      }));
    }
    
    setCurrentStep(3); // Move to metadata step
  };

  const handleExtractionProgress = (progress) => {
    setUploadProgress(progress);
  };

  const createChapters = async (bookId, textContent) => {
    const chapters = [];
    
    // Group paragraphs into chapters (every 5-10 paragraphs = 1 chapter)
    const paragraphsPerChapter = 8;
    const chapterGroups = [];
    
    for (let i = 0; i < textContent.length; i += paragraphsPerChapter) {
      chapterGroups.push(textContent.slice(i, i + paragraphsPerChapter));
    }
    
    // Create chapter records
    for (let i = 0; i < chapterGroups.length; i++) {
      const chapterContent = chapterGroups[i].join('\n\n');
      const wordCount = chapterContent.split(/\s+/).length;
      const estimatedReadingTime = Math.ceil(wordCount / 250); // 250 words per minute
      
      const { data: chapter, error } = await supabase
        .from('chapters')
        .insert({
          book_id: bookId,
          title: `Chapter ${i + 1}`,
          chapter_number: i + 1,
          content: chapterContent,
          word_count: wordCount,
          estimated_reading_time: estimatedReadingTime
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating chapter:', error);
        throw error;
      }
      
      chapters.push(chapter);
    }
    
    return chapters;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      onUploadError('Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      onUploadError('You must be logged in to upload books');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Create book record
      setUploadProgress(20);
      
      const totalWords = extractedContent.text.join(' ').split(/\s+/).length;
      const estimatedPages = Math.ceil(totalWords / 250); // Rough estimate
      
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          title: formData.title,
          author: formData.author,
          description: formData.description || 'No description provided.',
          language: formData.language,
          pages: estimatedPages,
          word_count: totalWords,
          tags: formData.tags,
          user_id: currentUser.id,
          file_type: extractedContent.format,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (bookError) {
        console.error('Error creating book:', bookError);
        throw bookError;
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
      }

      setUploadProgress(50);

<<<<<<< HEAD
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
=======
      // Step 2: Create chapters from extracted content
      const chapters = await createChapters(book.id, extractedContent.text);
      
      setUploadProgress(80);

      // Step 3: Update book status to completed
      const { error: updateError } = await supabase
        .from('books')
        .update({ processing_status: 'completed' })
        .eq('id', book.id);

      if (updateError) {
        console.error('Error updating book status:', updateError);
        throw updateError;
      }

      // Step 4: Create initial reading progress
      await supabase
        .from('reading_progress')
        .insert({
          user_id: currentUser.id,
          book_id: book.id,
          chapter_id: chapters[0]?.id,
          progress_percentage: 0,
          reading_mode: 'text'
        });

      setUploadProgress(100);

      // Success callback
      onUploadSuccess({
        bookId: book.id,
        title: book.title,
        author: book.author,
        chapters: chapters.length,
        pages: estimatedPages
      });

      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        language: 'en',
        tags: []
      });
      setExtractedContent(null);
      setCurrentStep(1);

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error.message || 'Failed to upload book. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      language: 'en',
      tags: []
    });
    setExtractedContent(null);
    setCurrentStep(1);
    setErrors({});
    setUploadProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Upload a Book</h2>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            3
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Select File</span>
          <span>Extract Content</span>
          <span>Add Details</span>
        </div>
      </div>

      {/* Step 1 & 2: File Selection and Extraction */}
      {currentStep <= 2 && (
        <div>
          <TextExtractor 
            onComplete={handleExtractionComplete}
            onProgress={handleExtractionProgress}
          />
          
          {extractedContent && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Content Extracted Successfully!</h4>
              <div className="text-sm text-green-700">
                <p><strong>Format:</strong> {extractedContent.format.toUpperCase()}</p>
                <p><strong>Paragraphs:</strong> {extractedContent.text.length}</p>
                <p><strong>Estimated Pages:</strong> {extractedContent.pages}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Metadata Form */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isUploading}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author*
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => handleFormChange('author', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.author ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isUploading}
            />
            {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleFormChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="fiction, adventure, educational"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${uploadProgress}%`}}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={resetUpload}
              disabled={isUploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Start Over
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !extractedContent}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
};

FileUpload.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  onUploadError: PropTypes.func.isRequired
};
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41

export default FileUpload; 