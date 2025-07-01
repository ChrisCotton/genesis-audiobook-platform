import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBook } from '../contexts/BookContext';

function Dashboard() {
  const { currentUser } = useAuth();
  const { books, loading } = useBook();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    booksRead: 0,
    pagesRead: 0,
    minutesListened: 0,
    quizzesCompleted: 0
  });

  // Calculate user statistics
  useEffect(() => {
    if (books.length > 0) {
      const booksStarted = books.filter(book => book.progress > 0).length;
      const pagesRead = books.reduce((total, book) => {
        return total + Math.floor(book.totalPages * (book.progress / 100));
      }, 0);
      // Estimate 2 minutes per page for listening time
      const minutesListened = pagesRead * 2;
      
      setStats({
        booksRead: booksStarted,
        pagesRead,
        minutesListened,
        quizzesCompleted: 3 // Hardcoded for demo
      });
    }
  }, [books]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!currentUser && !loading) {
      navigate('/auth');
    }
  }, [currentUser, loading, navigate]);

  // Get recent books (last 3 opened)
  const recentBooks = [...books]
    .filter(book => book.lastOpened)
    .sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened))
    .slice(0, 3);
  
  // Get books in progress
  const booksInProgress = books.filter(book => book.progress > 0 && book.progress < 100);
  
  // Get recommended books (for demo, just books not started yet)
  const recommendedBooks = books.filter(book => book.progress === 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {currentUser?.displayName || 'Reader'}
            </h1>
            <p className="mt-2 text-gray-600">
              Continue your learning journey with Genesis. 
              {stats.booksRead > 0 ? 
                ` You've made progress on ${stats.booksRead} book${stats.booksRead > 1 ? 's' : ''}.` : 
                ' Start exploring books to begin your journey.'}
            </p>
          </div>
          <Link 
            to="/library" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Book
          </Link>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Books in Progress</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.booksRead}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Pages Read</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.pagesRead}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 01-1.414-2.728m-1.414-6.728a9 9 0 010 12.728" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Minutes Listened</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.minutesListened}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Quizzes Completed</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.quizzesCompleted}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Continue reading section */}
      {recentBooks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBooks.map(book => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex h-40">
                  <div className="w-1/3 bg-gray-200 flex items-center justify-center">
                    {/* Book cover image */}
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-2/3 p-4 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="mt-auto">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{book.progress}% complete</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommended books section */}
      {recommendedBooks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedBooks.map(book => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex h-40">
                  <div className="w-1/3 bg-gray-200 flex items-center justify-center">
                    {/* Book cover image */}
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-2/3 p-4">
                    <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-md mb-2">
                      New
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{book.author}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{book.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* No books message */}
      {books.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Your library is empty</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first book to Genesis.
          </p>
          <Link 
            to="/library" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors duration-200"
          >
            Add Your First Book
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
