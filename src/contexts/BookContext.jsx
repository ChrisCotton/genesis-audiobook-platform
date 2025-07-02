import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
<<<<<<< HEAD
import supabase from '../config/supabase';
=======
import { supabase } from '../config/supabase';
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41

// Create book context
const BookContext = createContext();

// Custom hook to use book context
export function useBook() {
  return useContext(BookContext);
}

export function BookProvider({ children }) {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load books from database
  const loadBooks = async () => {
    if (!currentUser) {
      setBooks([]);
      setUserQuizzes([]);
      setAnnotations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Fetch user's books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select(`
          *,
          reading_progress(
            progress_percentage,
            last_read_at
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false });

      if (booksError) {
        console.error('Error fetching books:', booksError);
        throw booksError;
      }

      // Transform data to match the expected format
      const transformedBooks = booksData.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverImage: book.cover_image_url,
        progress: book.reading_progress?.[0]?.progress_percentage || 0,
        totalPages: book.pages,
        uploadedBy: book.user_id,
        uploadedAt: book.created_at,
        lastOpened: book.reading_progress?.[0]?.last_read_at || null,
        hasAudioNarration: false, // Will be updated when audio features are implemented
        tags: book.tags || [],
        language: book.language,
        wordCount: book.word_count,
        fileType: book.file_type
      }));

      setBooks(transformedBooks);

      // Fetch user's quiz attempts
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quiz_attempts')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          completed_at,
          quizzes(
            title,
            book_id
          )
        `)
        .eq('user_id', currentUser.id)
        .order('completed_at', { ascending: false });

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
      } else {
        const transformedQuizzes = quizzesData.map(attempt => ({
          id: attempt.id,
          bookId: attempt.quizzes.book_id,
          title: attempt.quizzes.title,
          completedAt: attempt.completed_at,
          score: attempt.score,
          totalQuestions: attempt.total_questions
        }));
        setUserQuizzes(transformedQuizzes);
      }

      // Fetch user's annotations
      const { data: annotationsData, error: annotationsError } = await supabase
        .from('annotations')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (annotationsError) {
        console.error('Error fetching annotations:', annotationsError);
      } else {
        const transformedAnnotations = annotationsData.map(annotation => ({
          id: annotation.id,
          bookId: annotation.book_id,
          userId: annotation.user_id,
          content: annotation.note_text,
          selectedText: annotation.selected_text,
          pageNumber: 0, // We don't have page numbers in the new schema, using chapter-based system
          chapterId: annotation.chapter_id,
          createdAt: annotation.created_at,
          color: annotation.highlight_color
        }));
        setAnnotations(transformedAnnotations);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load books when user changes
  useEffect(() => {
    loadBooks();
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

<<<<<<< HEAD
  // Add new book
  const addBook = async (bookData) => {
    try {
      // Prepare book data for database
      const bookToInsert = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description || 'No description provided.',
        cover_image_url: bookData.coverImage || null,
        file_path: bookData.filePath || null,
        file_url: bookData.fileUrl || null,
        original_filename: bookData.originalName || null,
        file_size: bookData.fileSize || 0,
        file_type: bookData.fileType || null,
        total_pages: bookData.totalPages || 0,
        extracted_content: bookData.extractedContent?.content || null,
        chapters: bookData.extractedContent?.chapters || null,
        user_id: currentUser.id,
        uploaded_at: new Date().toISOString(),
        last_opened_at: null,
        reading_progress: 0,
        has_audio_narration: false,
        tags: bookData.tags || []
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('books')
        .insert([bookToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Fallback to local storage for now
        return addBookLocally(bookData);
      }

      // Convert database format back to UI format
      const newBook = {
        id: data.id,
        title: data.title,
        author: data.author,
        description: data.description,
        coverImage: data.cover_image_url,
        progress: data.reading_progress,
        totalPages: data.total_pages,
        uploadedBy: data.user_id,
        uploadedAt: data.uploaded_at,
        lastOpened: data.last_opened_at,
        hasAudioNarration: data.has_audio_narration,
        tags: data.tags || [],
        filePath: data.file_path,
        fileUrl: data.file_url,
        extractedContent: data.extracted_content
      };

      setBooks(prevBooks => [...prevBooks, newBook]);
      return newBook;

    } catch (error) {
      console.error('Error adding book:', error);
      // Fallback to local storage
      return addBookLocally(bookData);
    }
  };

  // Fallback function for when Supabase is not available
  const addBookLocally = (bookData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBook = {
          id: String(Date.now()), // Use timestamp as ID
          ...bookData,
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          lastOpened: null,
          progress: 0
        };
        
        setBooks(prevBooks => [...prevBooks, newBook]);
        
        resolve(newBook);
      }, 1000);
    });
=======
  // Add new book (this is now handled by FileUpload component)
  const addBook = async (bookData) => {
    // This method is kept for backward compatibility
    // but the actual book creation is now handled in FileUpload component
    console.log('Adding book:', bookData);
    return Promise.resolve(bookData);
>>>>>>> d0dfb41028177582b68f6cd95ada84723c483f41
  };

  // Update book progress
  const updateBookProgress = async (bookId, progress) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: currentUser.id,
          book_id: bookId,
          progress_percentage: progress,
          last_read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,book_id'
        });

      if (error) throw error;

      // Update local state
      setBooks(prevBooks => prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, progress: progress, lastOpened: new Date().toISOString() }
          : book
      ));
    } catch (error) {
      console.error('Error updating book progress:', error);
    }
  };

  // Add quiz result
  const addQuizResult = async (bookId, quizData) => {
    if (!currentUser) return;

    try {
      // First, find or create the quiz
      let { data: existingQuiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('book_id', bookId)
        .eq('title', quizData.title)
        .single();

      if (quizError && quizError.code === 'PGRST116') {
        // Quiz doesn't exist, create it
        const { data: newQuiz, error: createError } = await supabase
          .from('quizzes')
          .insert({
            book_id: bookId,
            title: quizData.title,
            description: `Auto-generated quiz: ${quizData.title}`,
            difficulty_level: 'intermediate'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        existingQuiz = newQuiz;
      } else if (quizError) {
        throw quizError;
      }

      // Add the quiz attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: currentUser.id,
          quiz_id: existingQuiz.id,
          score: quizData.score,
          total_questions: quizData.totalQuestions,
          completed_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (attemptError) throw attemptError;

      // Update local state
      const newQuizResult = {
        id: attempt.id,
        bookId: bookId,
        title: quizData.title,
        completedAt: attempt.completed_at,
        score: attempt.score,
        totalQuestions: attempt.total_questions
      };

      setUserQuizzes(prev => [...prev, newQuizResult]);
      return newQuizResult;
    } catch (error) {
      console.error('Error adding quiz result:', error);
      throw error;
    }
  };

  // Add annotation
  const addAnnotation = async (bookId, content, chapterId, selectedText = '', color = 'yellow') => {
    if (!currentUser) return;

    try {
      const { data: annotation, error } = await supabase
        .from('annotations')
        .insert({
          book_id: bookId,
          chapter_id: chapterId,
          user_id: currentUser.id,
          note_text: content,
          selected_text: selectedText,
          highlight_color: color,
          annotation_type: 'note',
          start_position: 0,
          end_position: selectedText.length
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update local state
      const newAnnotation = {
        id: annotation.id,
        bookId: annotation.book_id,
        userId: annotation.user_id,
        content: annotation.note_text,
        selectedText: annotation.selected_text,
        pageNumber: 0,
        chapterId: annotation.chapter_id,
        createdAt: annotation.created_at,
        color: annotation.highlight_color
      };

      setAnnotations(prev => [...prev, newAnnotation]);
      return newAnnotation;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  };

  // Delete book
  const deleteBook = async (bookId) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Update local state
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      setUserQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.bookId !== bookId));
      setAnnotations(prevAnnotations => prevAnnotations.filter(annotation => annotation.bookId !== bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const value = {
    books,
    userQuizzes,
    annotations,
    loading,
    getBook,
    getBookQuizzes,
    getBookAnnotations,
    addBook,
    updateBookProgress,
    addQuizResult,
    addAnnotation,
    deleteBook,
    loadBooks // Export loadBooks so it can be called after successful uploads
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
}