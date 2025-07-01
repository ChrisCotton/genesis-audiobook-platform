import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function BookViewer({ book, onProgressUpdate }) {
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
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  // Sample book content (would come from API in real app)
  const bookContent = {
    1: {
      content: `<h2>Chapter 1: Introduction</h2>
        <p>The concept of innovation has never been more central to business success than it is today. In an era of rapid technological advancement, shifting consumer behaviors, and global competition, companies must innovate to survive.</p>
        <p>Yet for many established businesses, the very capabilities that led to their success create barriers to innovation that eventually contribute to their downfall. This paradox stands at the heart of what we call the innovator's dilemma.</p>
        <p>This book explores why great companies can do everything "right" and still lose their market leadership—or even fail—as new, unexpected competitors rise and take over the market. The answer doesn't lie in conventional management wisdom; it requires an entirely new approach.</p>`,
      audioUrl: null
    },
    2: {
      content: `<h2>Chapter 1: Introduction (continued)</h2>
        <p>The fundamental principles of good management that are taught in business schools—listen to customers, invest in improvements that provide customers more and better of what they want, seek higher margins—can lead established companies to miss disruptive innovations.</p>
        <p>These disruptive innovations often initially result in worse performance according to traditional metrics. They start by offering a different package of attributes valued only in emerging markets remote from, and unimportant to, the mainstream.</p>
        <p>This book introduces a framework for understanding when established companies should continue to follow traditional management practices, and when they should adopt an alternative set of principles.</p>`,
      audioUrl: null
    },
    3: {
      content: `<h2>Chapter 2: How Can Great Firms Fail?</h2>
        <p>The history of business is filled with examples of once-dominant companies that failed to adapt to technological or market changes. From the mechanical excavator industry to disk drives, we can observe patterns that repeat across industries and time periods.</p>
        <p>While these failures are often attributed to bureaucracy, complacency, or poor management, a deeper analysis reveals that even well-managed companies making seemingly rational decisions can still fail when facing certain types of market and technological change.</p>
        <p>The patterns of innovation we will explore show that there is something about the way decisions get made in successful organizations that sows the seeds of eventual failure.</p>`,
      audioUrl: null
    }
  };

  const totalPages = book.totalPages || Object.keys(bookContent).length || 3;

  // Set initial page based on progress
  useEffect(() => {
    if (book.progress > 0) {
      const estimatedPage = Math.ceil((book.progress / 100) * totalPages);
      setCurrentPage(estimatedPage > totalPages ? totalPages : estimatedPage);
    }
  }, [book.progress, totalPages]);

  // Update progress when page changes
  useEffect(() => {
    const newProgress = Math.round((currentPage / totalPages) * 100);
    if (newProgress !== book.progress) {
      onProgressUpdate(newProgress > 100 ? 100 : newProgress);
    }
  }, [currentPage, totalPages, book.progress, onProgressUpdate]);

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
    
    setCurrentPage(newPage);
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
  const addAnnotation = () => {
    if (annotationText) {
      const newAnnotation = {
        id: annotations.length + 1,
        text: annotationText,
        highlight: highlightedText,
        page: currentPage,
        createdAt: new Date().toISOString(),
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setAnnotationText('');
      setHighlightedText('');
      setShowAnnotationPanel(false);
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Audio element (hidden) */}
      {book.hasAudioNarration && (
        <audio
          ref={audioRef}
          src={bookContent[currentPage]?.audioUrl || ""}
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
              disabled={!book.hasAudioNarration}
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
        {/* Main content area */}
        <div className={`flex-grow ${showAnnotationPanel ? 'w-2/3' : 'w-full'}`}>
          {/* Audio player controls (shown in audio mode) */}
          {isAudioMode && book.hasAudioNarration && (
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700"
                  aria-label={isPlaying ? "Pause" : "Play"}
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
                </button>
                
                <div className="flex-grow">
                  <div className="bg-gray-300 h-2 rounded-full">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${audioProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <button
                    onClick={() => handlePlaybackRateChange(Math.max(0.5, playbackRate - 0.25))}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Decrease playback speed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-700 mx-2">{playbackRate}x</span>
                  <button
                    onClick={() => handlePlaybackRateChange(Math.min(2, playbackRate + 0.25))}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Increase playback speed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
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
          )}
          
          {/* Book content */}
          <div
            ref={contentRef}
            className="p-8 max-h-[70vh] overflow-y-auto prose prose-lg mx-auto"
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: bookContent[currentPage]?.content || 'Content not available' }}
          ></div>
        </div>
        
        {/* Annotation panel (conditionally rendered) */}
        {showAnnotationPanel && (
          <div className="w-1/3 border-l border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Notes & Highlights</h3>
              <button
                onClick={() => setShowAnnotationPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {highlightedText && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm font-medium text-gray-700">{highlightedText}</p>
              </div>
            )}
            
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="Add a note..."
                rows="3"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={addAnnotation}
                  disabled={!annotationText}
                  className={`px-3 py-1 rounded text-sm font-medium ${annotationText ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Save Note
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Notes</h4>
              
              {annotations.length > 0 ? (
                <div className="space-y-3">
                  {annotations
                    .filter(a => a.page === currentPage)
                    .map(annotation => (
                      <div key={annotation.id} className="bg-white border border-gray-200 rounded-md p-3">
                        {annotation.highlight && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2 text-xs text-gray-700">
                            "{annotation.highlight}"
                          </div>
                        )}
                        <p className="text-sm text-gray-800">{annotation.text}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>Page {annotation.page}</span>
                          <span>{new Date(annotation.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes for this page yet.</p>
              )}
            </div>
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