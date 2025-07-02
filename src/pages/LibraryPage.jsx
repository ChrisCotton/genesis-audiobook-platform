import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBook } from '../contexts/BookContext';
import BookCard from '../components/book/BookCard';
import FileUpload from '../components/book/FileUpload';

function LibraryPage() {
  const { currentUser } = useAuth();
  const { books, loading, loadBooks } = useBook();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
<<<<<<< HEAD
  const [uploadStep, setUploadStep] = useState(1); // 1: File Upload, 2: Add Details
  const [extractedBookData, setExtractedBookData] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    description: '',
    language: 'English',
    tags: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
=======
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadMessageType, setUploadMessageType] = useState(''); // 'success' or 'error'
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!currentUser && !loading) {
      navigate('/auth');
    }
  }, [currentUser, loading, navigate]);

  // Filter books based on search query and filter
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        book.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'in-progress') return matchesSearch && book.progress > 0 && book.progress < 100;
    if (filter === 'completed') return matchesSearch && book.progress === 100;
    if (filter === 'not-started') return matchesSearch && book.progress === 0;
    
    return matchesSearch;
  });

<<<<<<< HEAD
  const handleUploadComplete = (bookData) => {
    setExtractedBookData(bookData);
    setUploadForm(prev => ({
      ...prev,
      title: bookData.title,
      author: bookData.author,
      description: bookData.extractedContent?.description || ''
    }));
    setUploadStep(2);
  };

  const handleUploadError = (error) => {
    setUploadError(error);
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadStep(1);
    setExtractedBookData(null);
    setUploadForm({
      title: '',
      author: '',
      description: '',
      language: 'English',
      tags: ''
    });
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    
    if (!uploadForm.title || !uploadForm.author || !extractedBookData) {
      setUploadError('Please fill in all required fields');
      return;
    }
=======
  const handleUploadSuccess = async (result) => {
    setUploadMessage(`Successfully uploaded "${result.title}" with ${result.chapters} chapters!`);
    setUploadMessageType('success');
    setShowUploadModal(false);
    
    // Reload books to show the new upload
    await loadBooks();
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setUploadMessage('');
      setUploadMessageType('');
    }, 5000);
  };

  const handleUploadError = (error) => {
    setUploadMessage(error);
    setUploadMessageType('error');
    
<<<<<<< HEAD
    try {
      // Combine extracted data with user input
      const bookToSave = {
        ...extractedBookData,
        title: uploadForm.title,
        author: uploadForm.author,
        description: uploadForm.description,
        language: uploadForm.language,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : []
      };
      
      await addBook(bookToSave);
      
      // Reset and close modal
      resetUploadModal();
    } catch (error) {
      console.error('Error uploading book:', error);
      setUploadError('Failed to save book. Please try again.');
    } finally {
      setIsUploading(false);
    }
=======
    // Clear error message after 5 seconds
    setTimeout(() => {
      setUploadMessage('');
      setUploadMessageType('');
    }, 5000);
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Upload Success/Error Message */}
      {uploadMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          uploadMessageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadMessageType === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {uploadMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Library</h1>
          <p className="text-gray-600 mt-1">
            {books.length > 0 
              ? `You have ${books.length} book${books.length > 1 ? 's' : ''} in your library` 
              : 'Your library is empty. Add books to get started.'}
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Book
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Books</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Books grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {searchQuery || filter !== 'all' ? (
            <>
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching books found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your library is empty</h3>
              <p className="text-gray-600 mb-4">Start building your collection by uploading your first book</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
              >
                Upload Your First Book
              </button>
            </>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
<<<<<<< HEAD
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Upload a Book</h2>
                  <div className="flex items-center mt-2 space-x-2">
                    {/* Step indicator */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <span className="text-sm font-semibold">1</span>
                    </div>
                    <div className={`h-0.5 w-16 ${uploadStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <span className="text-sm font-semibold">2</span>
                    </div>
                    <div className={`h-0.5 w-16 ${uploadStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <span className="text-sm font-semibold">3</span>
                    </div>
                  </div>
                  <div className="flex space-x-16 mt-2 text-sm text-gray-600">
                    <span className={uploadStep === 1 ? 'font-semibold text-blue-600' : ''}>Select File</span>
                    <span className={uploadStep === 2 ? 'font-semibold text-blue-600' : ''}>Extract Content</span>
                    <span className={uploadStep === 3 ? 'font-semibold text-blue-600' : ''}>Add Details</span>
                  </div>
                </div>
                <button 
                  onClick={resetUploadModal}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {uploadError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
                  <p>{uploadError}</p>
                </div>
              )}
              
              {/* Step 1: File Upload */}
              {uploadStep === 1 && (
                <div>
                  <FileUpload 
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={resetUploadModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Add Details */}
              {uploadStep === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Title*
                      </label>
                      <input
                        type="text"
                        id="bookTitle"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-700 mb-1">
                        Author*
                      </label>
                      <input
                        type="text"
                        id="bookAuthor"
                        value={uploadForm.author}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bookDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="bookDescription"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="XXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        id="language"
                        value={uploadForm.language}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="non-fiction, psychology, business"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setUploadStep(1)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Start Over
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : 'Upload Book'}
                    </button>
                  </div>
                </form>
              )}
=======
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Upload New Book</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <FileUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryPage;