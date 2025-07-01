import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function BookCard({ book }) {
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Determine progress class
  const getProgressColorClass = (progress) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Default book cover if no image is available
  const getBookCoverFallback = () => (
    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  );
  
  return (
    <Link 
      to={`/book/${book.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
    >
      <div className="relative pt-[70%]">
        {/* Book cover */}
        <div className="absolute inset-0">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full ${book.coverImage ? 'hidden' : 'flex'} bg-gray-300 items-center justify-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          {/* Audio indicator */}
          {book.hasAudioNarration && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5" title="Audio narration available">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 01-1.414-2.728m-1.414-6.728a9 9 0 010 12.728" />
              </svg>
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5">
            <div 
              className={`h-full ${getProgressColorClass(book.progress)}`} 
              style={{ width: `${book.progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
        
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {book.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{book.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{book.description}</p>
      </div>
      
      <div className="px-4 pb-4 pt-2 mt-auto border-t border-gray-100 text-xs text-gray-500 flex justify-between">
        <div>
          <span className="font-medium">Pages:</span> {book.totalPages}
        </div>
        <div>
          <span className="font-medium">Last read:</span> {formatDate(book.lastOpened)}
        </div>
      </div>
      
      {/* Read status indicator */}
      <div className="absolute top-0 left-0">
        {book.progress === 0 ? (
          <div className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold">
            New
          </div>
        ) : book.progress === 100 ? (
          <div className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold">
            Completed
          </div>
        ) : book.progress > 0 ? (
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold">
            {book.progress}% Read
          </div>
        ) : null}
      </div>
    </Link>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    description: PropTypes.string,
    coverImage: PropTypes.string,
    progress: PropTypes.number,
    totalPages: PropTypes.number,
    lastOpened: PropTypes.string,
    hasAudioNarration: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default BookCard;
