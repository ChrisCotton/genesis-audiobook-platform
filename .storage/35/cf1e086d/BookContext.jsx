import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Create book context
const BookContext = createContext();

// Custom hook to use book context
export function useBook() {
  return useContext(BookContext);
}

// Mock book data
const MOCK_BOOKS = [
  {
    id: '1',
    title: 'The Innovator\'s Dilemma',
    author: 'Clayton Christensen',
    description: 'A revolutionary business book that has changed corporate America forever.',
    coverImage: '/assets/covers/innovators-dilemma.jpg',
    progress: 35,
    totalPages: 225,
    uploadedBy: '1',
    uploadedAt: new Date(2023, 4, 15).toISOString(),
    lastOpened: new Date(2023, 5, 20).toISOString(),
    hasAudioNarration: true,
    tags: ['Business', 'Innovation', 'Technology']
  },
  {
    id: '2',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    description: 'The renowned psychologist and winner of the Nobel Prize in Economics explains how we think.',
    coverImage: '/assets/covers/thinking-fast-slow.jpg',
    progress: 15,
    totalPages: 499,
    uploadedBy: '1',
    uploadedAt: new Date(2023, 3, 5).toISOString(),
    lastOpened: new Date(2023, 5, 10).toISOString(),
    hasAudioNarration: true,
    tags: ['Psychology', 'Decision Making', 'Behavioral Economics']
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy & proven way to build good habits & break bad ones.',
    coverImage: '/assets/covers/atomic-habits.jpg',
    progress: 70,
    totalPages: 320,
    uploadedBy: '1',
    uploadedAt: new Date(2023, 2, 20).toISOString(),
    lastOpened: new Date(2023, 5, 18).toISOString(),
    hasAudioNarration: true,
    tags: ['Self Help', 'Productivity', 'Psychology']
  },
  {
    id: '4',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness.',
    coverImage: '/assets/covers/psychology-money.jpg',
    progress: 0,
    totalPages: 256,
    uploadedBy: '1',
    uploadedAt: new Date(2023, 5, 1).toISOString(),
    lastOpened: null,
    hasAudioNarration: false,
    tags: ['Finance', 'Psychology', 'Personal Development']
  }
];

// Mock quiz data (user's quizzes for each book)
const MOCK_QUIZZES = [
  {
    id: '1',
    bookId: '1',
    title: 'Chapter 1-3 Quiz',
    completedAt: new Date(2023, 5, 18).toISOString(),
    score: 8,
    totalQuestions: 10
  },
  {
    id: '2',
    bookId: '1',
    title: 'Innovation Concepts Quiz',
    completedAt: new Date(2023, 5, 19).toISOString(),
    score: 7,
    totalQuestions: 10
  },
  {
    id: '3',
    bookId: '3',
    title: 'Habit Formation Basics',
    completedAt: new Date(2023, 5, 20).toISOString(),
    score: 10,
    totalQuestions: 10
  }
];

// Mock annotation data
const MOCK_ANNOTATIONS = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    content: 'This concept of disruptive innovation is crucial to understand in modern business!',
    pageNumber: 42,
    createdAt: new Date(2023, 5, 16).toISOString(),
    color: 'yellow'
  },
  {
    id: '2',
    bookId: '1',
    userId: '1',
    content: 'Great example of how established companies can miss market shifts.',
    pageNumber: 67,
    createdAt: new Date(2023, 5, 17).toISOString(),
    color: 'green'
  },
  {
    id: '3',
    bookId: '3',
    userId: '1',
    content: 'The 1% improvement concept is revolutionary for building habits.',
    pageNumber: 23,
    createdAt: new Date(2023, 5, 18).toISOString(),
    color: 'blue'
  }
];

export function BookProvider({ children }) {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load books when user changes
  useEffect(() => {
    const fetchBooks = () => {
      if (currentUser) {
        // Simulate fetch delay
        setTimeout(() => {
          setBooks(MOCK_BOOKS.filter(book => book.uploadedBy === currentUser.id));
          setUserQuizzes(MOCK_QUIZZES);
          setAnnotations(MOCK_ANNOTATIONS.filter(anno => anno.userId === currentUser.id));
          setLoading(false);
        }, 800);
      } else {
        setBooks([]);
        setUserQuizzes([]);
        setAnnotations([]);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentUser]);

  // Get book by ID
  const getBook = (bookId) => {
    return books.find(book => book.id === bookId) || null;
  };

  // Get quizzes for a book
  const getBookQuizzes = (bookId) => {
    return userQuizzes.filter(quiz => quiz.bookId === bookId);
  };

  // Get annotations for a book
  const getBookAnnotations = (bookId) => {
    return annotations.filter(annotation => annotation.bookId === bookId);
  };

  // Add new book
  const addBook = (bookData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBook = {
          id: String(MOCK_BOOKS.length + 1),
          ...bookData,
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          lastOpened: null,
          progress: 0
        };
        
        setBooks(prevBooks => [...prevBooks, newBook]);
        MOCK_BOOKS.push(newBook);
        
        resolve(newBook);
      }, 1000);
    });
  };

  // Update book progress
  const updateBookProgress = (bookId, progress) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setBooks(prevBooks => prevBooks.map(book => 
          book.id === bookId ? { ...book, progress, lastOpened: new Date().toISOString() } : book
        ));
        
        // Also update in mock data
        const bookIndex = MOCK_BOOKS.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
          MOCK_BOOKS[bookIndex].progress = progress;
          MOCK_BOOKS[bookIndex].lastOpened = new Date().toISOString();
        }
        
        resolve();
      }, 500);
    });
  };

  // Add annotation
  const addAnnotation = (bookId, content, pageNumber, color = 'yellow') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAnnotation = {
          id: String(MOCK_ANNOTATIONS.length + 1),
          bookId,
          userId: currentUser.id,
          content,
          pageNumber,
          createdAt: new Date().toISOString(),
          color
        };
        
        setAnnotations(prev => [...prev, newAnnotation]);
        MOCK_ANNOTATIONS.push(newAnnotation);
        
        resolve(newAnnotation);
      }, 500);
    });
  };

  // Context value
  const value = {
    books,
    loading,
    getBook,
    getBookQuizzes,
    getBookAnnotations,
    addBook,
    updateBookProgress,
    addAnnotation
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
}
