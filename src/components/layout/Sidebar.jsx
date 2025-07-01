import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Common navigation items
  const navItems = [
    { 
      path: '/', 
      exact: true, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ), 
      text: 'Dashboard' 
    },
    { 
      path: '/library', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 4a1 1 0 00-1 1v1h10V5a1 1 0 00-1-1H7zM4 7a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
          <path d="M2 9a2 2 0 012-2h1v10H3a2 2 0 01-2-2V9z" />
        </svg>
      ), 
      text: 'My Library' 
    }
  ];

  // Learning-related navigation items
  const learningItems = [
    { 
      path: '/learning/quizzes', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ), 
      text: 'Quizzes' 
    },
    { 
      path: '/learning/flashcards', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ), 
      text: 'Flashcards' 
    },
    { 
      path: '/learning/mindmaps', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ), 
      text: 'Mind Maps' 
    }
  ];

  // Social-related navigation items
  const socialItems = [
    { 
      path: '/community/bookclubs', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ), 
      text: 'Book Clubs' 
    },
    { 
      path: '/community/discussions', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
        </svg>
      ), 
      text: 'Discussions' 
    },
    { 
      path: '/community/experts', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      ), 
      text: 'Expert Connect' 
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white w-64 py-4 px-2">
      <div className="px-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="ml-2 text-xl font-bold">Genesis</span>
        </div>
      </div>
      
      {currentUser ? (
        <>
          {/* Navigation section */}
          <div className="mb-8">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </h3>
            <div className="mt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mt-1 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-white bg-gray-700 rounded-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.text}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Learning Tools section */}
          <div className="mb-8">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Learning Tools
            </h3>
            <div className="mt-2">
              {learningItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mt-1 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-white bg-gray-700 rounded-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.text}
                </NavLink>
              ))}
            </div>
          </div>
          
          {/* Community section */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Community
            </h3>
            <div className="mt-2">
              {socialItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mt-1 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-white bg-gray-700 rounded-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.text}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow px-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="mt-4 text-gray-400">Sign in to access all features of Genesis</p>
          <NavLink
            to="/auth"
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Sign In
          </NavLink>
        </div>
      )}
      
      {/* Version info */}
      <div className="mt-auto pt-4 px-4 text-xs text-gray-500">
        <p>Genesis v0.1.0 (Beta)</p>
      </div>
    </div>
  );
}

export default Sidebar;