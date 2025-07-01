/**
 * Mock data for Genesis platform unit tests
 */

// Mock User Data
export const mockUsers = [
  {
    id: '1',
    username: 'testuser1',
    email: 'test1@example.com',
    name: 'Test User',
    avatar: '/assets/images/avatars/default.png',
    languagePreference: 'en',
    learningLevel: 'intermediate',
    joinDate: '2023-01-15T12:00:00Z'
  },
  {
    id: '2',
    username: 'learner123',
    email: 'learner@example.com',
    name: 'Language Learner',
    avatar: '/assets/images/avatars/user2.png',
    languagePreference: 'es',
    learningLevel: 'beginner',
    joinDate: '2023-03-20T09:30:00Z'
  }
];

// Mock Book Data
export const mockBooks = [
  {
    id: '1',
    title: 'The Great Adventure',
    author: 'Jane Smith',
    description: 'An epic journey through magical lands.',
    coverImage: '/assets/images/books/great-adventure.jpg',
    uploadDate: '2023-04-10T14:22:00Z',
    language: 'en',
    pages: 248,
    readingLevel: 'intermediate',
    tags: ['fantasy', 'adventure', 'magic'],
    userId: '1',
    progress: 0.35
  },
  {
    id: '2',
    title: 'Spanish for Beginners',
    author: 'Miguel Rodriguez',
    description: 'A beginner-friendly guide to Spanish language.',
    coverImage: '/assets/images/books/spanish-beginners.jpg',
    uploadDate: '2023-05-15T09:10:00Z',
    language: 'es',
    pages: 120,
    readingLevel: 'beginner',
    tags: ['language', 'educational', 'spanish'],
    userId: '2',
    progress: 0.15
  },
  {
    id: '3',
    title: 'Mystery at Midnight',
    author: 'Arthur Johnson',
    description: 'A thrilling detective story with unexpected twists.',
    coverImage: '/assets/images/books/mystery-midnight.jpg',
    uploadDate: '2023-03-22T11:45:00Z',
    language: 'en',
    pages: 186,
    readingLevel: 'advanced',
    tags: ['mystery', 'thriller', 'detective'],
    userId: '1',
    progress: 0.75
  }
];

// Mock Book Content
export const mockBookContent = {
  '1': {
    chapters: [
      {
        id: '1-1',
        title: 'The Beginning',
        content: [
          'Once upon a time, in a land far away, there lived a young adventurer named Leo.',
          'Leo had always dreamed of exploring the world beyond the mountains that surrounded his small village.',
          'One morning, as the sun was just beginning to rise, Leo packed his small bag with essentials and set off on what would become the journey of a lifetime.'
        ]
      },
      {
        id: '1-2',
        title: 'The Forest of Whispers',
        content: [
          'The Forest of Whispers was known throughout the land as a place of mystery and magic.',
          'Trees towered overhead, their branches intertwining to form a dense canopy that blocked out much of the sunlight.',
          'As Leo ventured deeper into the forest, he began to hear faint whispers carried on the gentle breeze.'
        ]
      }
    ]
  },
  '2': {
    chapters: [
      {
        id: '2-1',
        title: 'Introducción al Español',
        content: [
          'El español es un idioma hermoso y melódico.',
          'En esta primera lección, aprenderemos los saludos básicos.',
          'Buenos días, buenas tardes, y buenas noches son las formas de saludar en diferentes momentos del día.'
        ]
      }
    ]
  }
};

// Mock Annotations
export const mockAnnotations = [
  {
    id: '101',
    bookId: '1',
    userId: '1',
    chapterId: '1-1',
    paragraphIndex: 2,
    text: 'This is where the adventure begins!',
    timestamp: '2023-04-15T10:22:00Z',
    color: 'yellow',
    isPublic: false
  },
  {
    id: '102',
    bookId: '1',
    userId: '1',
    chapterId: '1-2',
    paragraphIndex: 0,
    text: 'I love the description of the forest.',
    timestamp: '2023-04-16T14:30:00Z',
    color: 'blue',
    isPublic: true
  }
];

// Mock AI Conversations
export const mockConversations = [
  {
    id: '201',
    bookId: '1',
    userId: '1',
    messages: [
      {
        role: 'user',
        content: 'Can you explain what the Forest of Whispers represents in the story?',
        timestamp: '2023-04-15T15:10:00Z'
      },
      {
        role: 'ai',
        content: 'In the story, the Forest of Whispers represents the unknown and the beginning of Leo\'s transformation. The whispers symbolize the calling of adventure and the mysterious forces that guide us toward our destiny. It\'s a common literary device in heroic journeys where the protagonist must venture into unfamiliar territory as part of their growth.',
        timestamp: '2023-04-15T15:10:05Z'
      }
    ]
  }
];

// Mock Quizzes
export const mockQuizzes = [
  {
    id: '301',
    bookId: '1',
    title: 'Comprehension Quiz: The Great Adventure',
    description: 'Test your understanding of the first two chapters',
    questions: [
      {
        question: 'What is the name of the main character?',
        options: ['Leo', 'Max', 'Sam', 'Jake'],
        correctAnswer: 0,
        explanation: 'The main character is introduced as Leo in the first paragraph.'
      },
      {
        question: 'What did Leo hear in the Forest of Whispers?',
        options: ['Birds singing', 'Wolves howling', 'Faint whispers', 'Running water'],
        correctAnswer: 2,
        explanation: 'As stated in the chapter, Leo heard faint whispers carried on the breeze.'
      }
    ]
  }
];

// Mock Vocabulary Lists
export const mockVocabulary = [
  {
    id: '401',
    bookId: '2',
    userId: '2',
    words: [
      {
        word: 'hermoso',
        definition: 'beautiful',
        context: 'El español es un idioma hermoso y melódico.',
        notes: 'Remember that hermoso/hermosa changes form based on gender',
        learned: true
      },
      {
        word: 'idioma',
        definition: 'language',
        context: 'El español es un idioma hermoso y melódico.',
        notes: '',
        learned: false
      }
    ]
  }
];

// Mock Reading Stats
export const mockReadingStats = {
  '1': {
    totalReadingTime: 345, // minutes
    lastReadDate: '2023-05-10T16:30:00Z',
    readingSessions: [
      {
        date: '2023-04-12T10:15:00Z',
        duration: 45, // minutes
        pagesRead: 18
      },
      {
        date: '2023-04-15T14:30:00Z',
        duration: 30,
        pagesRead: 12
      }
    ],
    wordsLearned: 24,
    quizzesCompleted: 2,
    averageScore: 85
  }
};

// Mock Progress Data
export const mockProgress = {
  '1': {
    currentChapter: '1-2',
    currentParagraph: 1,
    bookmarks: [
      {
        chapterId: '1-1',
        paragraphIndex: 0,
        note: 'Start of the story',
        timestamp: '2023-04-11T09:20:00Z'
      }
    ]
  }
};

// Mock Voice Settings
export const mockVoiceSettings = {
  '1': {
    voice: 'English (US) - Female',
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8
  }
};

// Mock File Upload Form Data
export const mockUploadFormData = {
  title: "Learning Italian Basics",
  author: "Marco Rossi",
  description: "A comprehensive guide for beginners learning Italian.",
  language: "it",
  readingLevel: "beginner"
};

// Mock Learning Goals
export const mockLearningGoals = [
  {
    id: '501',
    userId: '1',
    title: 'Read 30 minutes daily',
    description: 'Develop consistent reading habit',
    type: 'reading',
    target: 30, // minutes per day
    progress: 15,
    startDate: '2023-05-01T00:00:00Z',
    endDate: '2023-05-31T23:59:59Z',
    completed: false,
    streak: 3 // days
  },
  {
    id: '502',
    userId: '1',
    title: 'Learn 50 new words',
    description: 'Expand vocabulary in Spanish',
    type: 'vocabulary',
    target: 50, // words
    progress: 24,
    startDate: '2023-05-01T00:00:00Z',
    endDate: '2023-05-31T23:59:59Z',
    completed: false,
    streak: 5 // days
  }
];

// Mock Feedback Data
export const mockFeedback = [
  {
    id: '601',
    userId: '1',
    bookId: '1',
    rating: 4.5,
    review: 'Great book with engaging storyline. The AI interactions really helped me understand the deeper themes.',
    timestamp: '2023-05-05T16:40:00Z',
    helpful: 12
  }
];

// Mock Social Interactions
export const mockSocialInteractions = {
  comments: [
    {
      id: '701',
      annotationId: '102',
      userId: '2',
      content: 'I agree! The forest description is very vivid.',
      timestamp: '2023-04-17T09:15:00Z',
      likes: 3
    }
  ],
  shares: [
    {
      id: '801',
      userId: '1',
      bookId: '1',
      platform: 'twitter',
      timestamp: '2023-04-20T11:30:00Z',
      content: 'Currently enjoying "The Great Adventure" - what a journey! #reading #books'
    }
  ],
  groups: [
    {
      id: '901',
      name: 'Fantasy Book Club',
      description: 'A group for fantasy book lovers',
      members: ['1', '2'],
      books: ['1'],
      discussions: [
        {
          id: '951',
          title: 'Symbolism in The Great Adventure',
          starter: '1',
          timestamp: '2023-04-22T15:45:00Z',
          posts: 8,
          lastActivity: '2023-04-25T10:20:00Z'
        }
      ]
    }
  ]
};
