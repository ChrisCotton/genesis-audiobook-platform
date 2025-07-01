/**
 * Mock data for Genesis platform unit tests
 * This file provides mock objects to simulate books, user data, annotations, and quizzes
 */

// Mock user data
export const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  },
  {
    id: '2',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    photoURL: null,
  }
];

// Mock book data
export const mockBooks = [
  {
    id: '1',
    title: 'The Innovator\'s Dilemma',
    author: 'Clayton Christensen',
    description: 'A revolutionary business book that has changed corporate America forever.',
    coverImage: '/assets/covers/innovators-dilemma.jpg',
    progress: 35,
    totalPages: 225,
    uploadedBy: '1',
    uploadedAt: '2023-05-15T10:30:00Z',
    lastOpened: '2023-05-20T14:22:00Z',
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
    uploadedAt: '2023-03-05T09:15:00Z',
    lastOpened: '2023-05-10T18:30:00Z',
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
    uploadedAt: '2023-02-20T16:45:00Z',
    lastOpened: '2023-05-18T20:10:00Z',
    hasAudioNarration: true,
    tags: ['Self Help', 'Productivity', 'Psychology']
  }
];

// Mock book content pages
export const mockBookContent = {
  '1': {
    1: {
      content: `<h2>Chapter 1: Introduction</h2>
        <p>The concept of innovation has never been more central to business success than it is today. In an era of rapid technological advancement, shifting consumer behaviors, and global competition, companies must innovate to survive.</p>
        <p>Yet for many established businesses, the very capabilities that led to their success create barriers to innovation that eventually contribute to their downfall. This paradox stands at the heart of what we call the innovator's dilemma.</p>`,
      audioUrl: '/assets/audio/innovators-dilemma-ch1.mp3'
    },
    2: {
      content: `<h2>Chapter 1: Introduction (continued)</h2>
        <p>The fundamental principles of good management that are taught in business schools can lead established companies to miss disruptive innovations.</p>
        <p>These disruptive innovations often initially result in worse performance according to traditional metrics. They start by offering a different package of attributes valued only in emerging markets.</p>`,
      audioUrl: '/assets/audio/innovators-dilemma-ch1-2.mp3'
    }
  },
  '2': {
    1: {
      content: `<h2>Chapter 1: Two Systems</h2>
        <p>To observe your System 1 at work, glance at the following image:</p>
        <p>Most people immediately see an angry face. You experienced a quick, automatic perception rather than a deliberate pondering of the features.</p>`,
      audioUrl: '/assets/audio/thinking-fast-slow-ch1.mp3'
    }
  }
};

// Mock annotations
export const mockAnnotations = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    content: 'This concept of disruptive innovation is crucial to understand in modern business!',
    pageNumber: 1,
    highlightedText: 'The concept of innovation has never been more central to business success than it is today',
    createdAt: '2023-05-16T10:30:00Z',
    color: 'yellow'
  },
  {
    id: '2',
    bookId: '1',
    userId: '1',
    content: 'Great example of how established companies can miss market shifts.',
    pageNumber: 2,
    highlightedText: 'The fundamental principles of good management that are taught in business schools can lead established companies to miss disruptive innovations',
    createdAt: '2023-05-17T14:22:00Z',
    color: 'green'
  }
];

// Mock quizzes
export const mockQuizzes = [
  {
    id: '1',
    bookId: '1',
    title: 'Chapter 1-3 Quiz',
    questions: [
      {
        id: '1-1',
        question: 'What does the author identify as the main paradox of the innovator\'s dilemma?',
        options: [
          'Companies that focus too much on innovation fail financially',
          'The very capabilities that lead to success can create barriers to innovation',
          'Innovative products are often too expensive for most customers',
          'Managers are typically resistant to new technologies'
        ],
        correctAnswer: 1
      },
      {
        id: '1-2',
        question: 'According to the book, disruptive innovations often initially:',
        options: [
          'Have better performance than existing products',
          'Cost more than existing products',
          'Result in worse performance according to traditional metrics',
          'Appeal to the company\'s most profitable customers'
        ],
        correctAnswer: 2
      }
    ],
    completedAt: '2023-05-18T10:30:00Z',
    score: 8,
    totalQuestions: 10
  },
  {
    id: '2',
    bookId: '2',
    title: 'System 1 and System 2',
    questions: [
      {
        id: '2-1',
        question: 'In Kahneman\'s model, System 1 is characterized by being:',
        options: [
          'Slow, effortful, and logical',
          'Fast, automatic, and intuitive',
          'Conscious, deliberate, and analytical',
          'Rarely used in everyday decisions'
        ],
        correctAnswer: 1
      },
      {
        id: '2-2',
        question: 'Which system is more prone to cognitive biases?',
        options: [
          'System 1',
          'System 2',
          'Both equally',
          'Neither'
        ],
        correctAnswer: 0
      }
    ],
    completedAt: null,
    score: null,
    totalQuestions: 10
  }
];

// Mock AI conversation data
export const mockAIConversations = {
  '1': [
    {
      id: 'ai-1',
      sender: 'ai',
      text: 'Hello! I\'m your Genesis AI assistant. How can I help you understand "The Innovator\'s Dilemma" better?',
      timestamp: '2023-06-01T09:00:00Z'
    },
    {
      id: 'user-1',
      sender: 'user',
      text: 'What is the main concept of the book?',
      timestamp: '2023-06-01T09:01:00Z'
    },
    {
      id: 'ai-2',
      sender: 'ai',
      text: 'The main concept in this book is "disruptive innovation", which describes how smaller companies with fewer resources can successfully challenge established businesses by targeting overlooked segments and then moving upmarket.',
      timestamp: '2023-06-01T09:01:15Z'
    }
  ]
};

// Mock upload data
export const mockUploadFormData = {
  title: 'New Test Book',
  author: 'Test Author',
  description: 'This is a test book for unit tests',
  file: new File(['test content'], 'test-book.pdf', { type: 'application/pdf' }),
  coverImage: null,
  totalPages: 150
};
[
    {
        "command_name": "Engineer2.write_new_code",
        "args": {
            "description": "Creating unit tests for authentication context",
            "paths": [
                "src/tests/contexts/AuthContext.test.js"
            ]
        }
    }
]
