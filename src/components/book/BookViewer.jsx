import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

function BookViewer({ book, onProgressUpdate }) {
  const { currentUser } = useAuth();
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  // Load book chapters and reading progress
  useEffect(() => {
    const loadBookData = async () => {
      if (!book?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Load chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('book_id', book.id)
          .order('chapter_number');
        
        if (chaptersError) throw chaptersError;
        
        setChapters(chaptersData || []);
        
        // Load user's reading progress
        if (currentUser) {
          const { data: progressData, error: progressError } = await supabase
            .from('reading_progress')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('book_id', book.id)
            .single();
          
          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Error loading progress:', progressError);
          }
          
          if (progressData) {
            // Find the chapter and calculate page
            const chapterIndex = chaptersData.findIndex(ch => ch.id === progressData.chapter_id);
            if (chapterIndex >= 0) {
              setCurrentPage(chapterIndex + 1);
              setCurrentChapter(chaptersData[chapterIndex]);
            }
          }
        }
        
        // Set initial chapter if no progress found
        if (chaptersData.length > 0 && !currentChapter) {
          setCurrentChapter(chaptersData[0]);
          setCurrentPage(1);
        }
        
      } catch (err) {
        console.error('Error loading book data:', err);
        setError('Failed to load book content. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookData();
  }, [book?.id, currentUser]);

  // Update reading progress when page changes
  useEffect(() => {
    if (!currentUser || !book?.id || !currentChapter) return;
    
    const updateProgress = async () => {
      const progressPercentage = Math.round((currentPage / chapters.length) * 100);
      
      try {
        const { error } = await supabase
          .from('reading_progress')
          .upsert({
            user_id: currentUser.id,
            book_id: book.id,
            chapter_id: currentChapter.id,
            paragraph_index: 0,
            character_position: 0,
            progress_percentage: progressPercentage,
            reading_mode: isAudioMode ? 'audio' : 'text',
            last_read_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,book_id'
          });
        
        if (error) {
          console.error('Error updating progress:', error);
        } else {
          onProgressUpdate(progressPercentage);
        }
      } catch (err) {
        console.error('Error updating reading progress:', err);
      }
    };
    
    // Debounce progress updates
    const timeoutId = setTimeout(updateProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentPage, currentChapter, isAudioMode, currentUser, book?.id, chapters.length, onProgressUpdate]);

  const totalPages = chapters.length;

  // Toggle between reading and listening modes
  const toggleAudioMode = () => {
    setIsAudioMode(!isAudioMode);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Play/pause audio
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle page navigation
  const changePage = (direction) => {
    let newPage = currentPage + direction;
    
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    
    if (newPage !== currentPage && chapters[newPage - 1]) {
      setCurrentPage(newPage);
      setCurrentChapter(chapters[newPage - 1]);
    }
  };

  // Handle text selection for annotations
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setHighlightedText('');
      return;
    }
    
    const text = selection.toString().trim();
    if (text.length > 0) {
      setHighlightedText(text);
    }
  };

  // Add annotation
  const addAnnotation = async () => {
    if (!annotationText || !currentUser || !currentChapter) return;
    
    try {
      const { data, error } = await supabase
        .from('annotations')
        .insert({
          book_id: book.id,
          chapter_id: currentChapter.id,
          user_id: currentUser.id,
          start_position: 0, // For now, simplified
          end_position: highlightedText.length,
          selected_text: highlightedText || 'Chapter annotation',
          note_text: annotationText,
          highlight_color: 'yellow',
          annotation_type: 'note'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setAnnotations([...annotations, data]);
      setAnnotationText('');
      setHighlightedText('');
      setShowAnnotationPanel(false);
    } catch (err) {
      console.error('Error adding annotation:', err);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Format chapter content for display
  const formatChapterContent = (content) => {
    if (!content) return 'Content not available';
    
    // Split content into paragraphs and wrap in HTML
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs
      .map(p => `<p class="mb-4">${p.trim()}</p>`)
      .join('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading book content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chapters.length) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">No content available for this book.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Audio element (hidden) */}
      {currentChapter?.audio_url && (
        <audio
          ref={audioRef}
          src={currentChapter.audio_url}
          onTimeUpdate={() => audioRef.current && setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      
      {/* Book viewer controls */}
      <div className="bg-gray-100 px-4 py-2 flex flex-wrap items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          {/* Page navigation */}
          <button
            onClick={() => changePage(-1)}
            disabled={currentPage <= 1}
            className={`p-1 rounded ${currentPage <= 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages}
            className={`p-1 rounded ${currentPage >= totalPages ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Mode toggle */}
          <div className="flex items-center rounded-full bg-gray-200 p-0.5">
            <button
              onClick={() => setIsAudioMode(false)}
              className={`px-3 py-1 text-xs font-medium rounded-full ${!isAudioMode ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            >
              Read
            </button>
            <button
              onClick={() => setIsAudioMode(true)}
              className={`px-3 py-1 text-xs font-medium rounded-full ${isAudioMode ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              disabled={!currentChapter?.audio_url}
            >
              Listen
            </button>
          </div>
          
          {/* Annotation button */}
          <button
            onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
            className={`p-1.5 rounded ${showAnnotationPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-200'}`}
            aria-label="Add annotation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Book content display */}
      <div className="flex">
        <div className="flex-1">
          {/* Chapter title */}
          {currentChapter && (
            <div className="px-8 pt-6 pb-2">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentChapter.title}
              </h2>
              {currentChapter.estimated_reading_time && (
                <p className="text-sm text-gray-600 mt-1">
                  ~{currentChapter.estimated_reading_time} min read
                </p>
              )}
            </div>
          )}

          {/* Audio controls (when in audio mode) */}
          {isAudioMode && currentChapter?.audio_url && (
            <div className="px-8 pb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    {/* Playback rate */}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-600">Speed:</span>
                      <select
                        value={playbackRate}
                        onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                    
                    {/* Volume */}
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20"
                        aria-label="Volume"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Book content */}
          <div
            ref={contentRef}
            className="p-8 max-h-[70vh] overflow-y-auto prose prose-lg mx-auto"
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{ 
              __html: formatChapterContent(currentChapter?.content)
            }}
          ></div>
        </div>
        
        {/* Annotation panel (conditionally rendered) */}
        {showAnnotationPanel && (
          <div className="w-80 bg-gray-50 border-l p-4">
            <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
            
            {highlightedText && (
              <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-400">
                <p className="text-sm text-gray-700">Selected text:</p>
                <p className="text-sm font-medium">"{highlightedText}"</p>
              </div>
            )}
            
            <textarea
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              placeholder="Add your note..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={addAnnotation}
                disabled={!annotationText}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowAnnotationPanel(false);
                  setAnnotationText('');
                  setHighlightedText('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
            
            {/* Show existing annotations */}
            {annotations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">Your Notes</h4>
                <div className="space-y-2">
                  {annotations.map((annotation) => (
                    <div key={annotation.id} className="p-2 bg-white rounded border text-sm">
                      <p className="text-gray-700">{annotation.note_text}</p>
                      {annotation.selected_text && (
                        <p className="text-xs text-gray-500 mt-1">
                          "{annotation.selected_text}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

BookViewer.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    progress: PropTypes.number,
    totalPages: PropTypes.number,
    hasAudioNarration: PropTypes.bool
  }).isRequired,
  onProgressUpdate: PropTypes.func.isRequired
};

export default BookViewer;