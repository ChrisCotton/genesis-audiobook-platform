import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBook } from '../contexts/BookContext';
import BookViewer from '../components/book/BookViewer';
import AIChat from '../components/conversation/AIChat';

function BookView() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getBook, loading, updateBookProgress } = useBook();
  const [currentBook, setCurrentBook] = useState(null);
  const [activeTab, setActiveTab] = useState('read'); // 'read', 'learn', 'discuss'
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    if (!currentUser && !loading) {
      navigate('/auth');
      return;
    }
    
    if (bookId && !loading) {
      const book = getBook(bookId);
      if (book) {
        setCurrentBook(book);
      } else {
        // Book not found
        navigate('/library');
      }
    }
  }, [bookId, currentUser, loading, getBook, navigate]);

  // Handle book progress update
  const handleProgressUpdate = (progress) => {
    if (currentBook && progress !== currentBook.progress) {
      updateBookProgress(bookId, progress);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading || !currentBook) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 bg-white z-50 overflow-auto p-4' : ''}`}>
      {/* Book header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{currentBook.title}</h1>
            <p className="text-gray-600">by {currentBook.author}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <button 
              onClick={toggleFullscreen}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-md"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h3a1 1 0 01.707.293l1.586 1.586a1 1 0 010 1.414l-1.586 1.586A1 1 0 019 14H6a1 1 0 01-1-1v-3zm8 0a1 1 0 00-1-1h-3a1 1 0 00-.707.293L6.707 10.879a1 1 0 000 1.414l1.586 1.586A1 1 0 009 14h3a1 1 0 001-1v-3z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              {currentBook.progress > 0 ? 'Continue Reading' : 'Start Reading'}
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{currentBook.progress}% complete</span>
            <span>{Math.floor(currentBook.progress * currentBook.totalPages / 100)} of {currentBook.totalPages} pages</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${currentBook.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'read'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('read')}
          >
            Read & Listen
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'learn'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('learn')}
          >
            Learning Tools
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discuss'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('discuss')}
          >
            Discuss
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'read' && (
          <BookViewer 
            book={currentBook} 
            onProgressUpdate={handleProgressUpdate}
          />
        )}
        
        {activeTab === 'learn' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quiz card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">Quizzes</h3>
                </div>
                <p className="text-gray-600 mb-4">Test your knowledge with quizzes generated from the book content.</p>
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md">
                  Start Quiz
                </button>
              </div>
              
              {/* Flashcards card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">Flashcards</h3>
                </div>
                <p className="text-gray-600 mb-4">Review key concepts with interactive flashcards generated from the book.</p>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md">
                  Study Flashcards
                </button>
              </div>
              
              {/* Mind map card */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">Mind Maps</h3>
                </div>
                <p className="text-gray-600 mb-4">Visualize connections between key concepts with interactive mind maps.</p>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-md">
                  Explore Mind Map
                </button>
              </div>
            </div>
            
            {/* Learning progress section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Learning Progress</h3>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                  <p className="text-gray-700 font-medium mb-2">Quiz Performance</p>
                  <div className="h-4 w-full bg-gray-200 rounded-full">
                    <div className="h-4 bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-sm text-gray-600">
                    <span>3 quizzes completed</span>
                    <span>75% average score</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-700 font-medium mb-2">Vocabulary Mastery</p>
                  <div className="h-4 w-full bg-gray-200 rounded-full">
                    <div className="h-4 bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-sm text-gray-600">
                    <span>23/57 terms mastered</span>
                    <span>40% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'discuss' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <AIChat bookId={bookId} />
              </div>
              
              <div>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Book Club Discussions
                  </h3>
                  <div className="border-t border-gray-200 -mx-6"></div>
                  <div className="py-4 px-6 border-b border-gray-200">
                    <p className="text-gray-800 font-medium">Innovation Discussion</p>
                    <p className="text-sm text-gray-600">Next meeting: Jun 30, 2023</p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Join Discussion →
                    </button>
                  </div>
                  <div className="py-4 px-6 border-b border-gray-200">
                    <p className="text-gray-800 font-medium">Author Analysis Group</p>
                    <p className="text-sm text-gray-600">Active discussion thread</p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      View Thread →
                    </button>
                  </div>
                  <div className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create a Book Club
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Popular Questions
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <button className="text-left w-full text-gray-700 hover:text-blue-600">
                        What is the main thesis of chapter 3?
                      </button>
                    </li>
                    <li>
                      <button className="text-left w-full text-gray-700 hover:text-blue-600">
                        How does the author define innovation?
                      </button>
                    </li>
                    <li>
                      <button className="text-left w-full text-gray-700 hover:text-blue-600">
                        Can you explain the case study from page 42?
                      </button>
                    </li>
                    <li>
                      <button className="text-left w-full text-gray-700 hover:text-blue-600">
                        How does this book compare to the author's previous work?
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookView;
