# Genesis - Interactive Audiobook & Learning Platform

An innovative platform that transforms traditional reading into an interactive, AI-powered learning experience combining audiobooks, visual learning tools, and conversational AI.

## 🚀 Features

- **Multi-format Book Upload**: Support for PDF, ePub, Mobi, TXT, and DOCX
- **Unified Reading Experience**: Seamless switching between text and audio modes
- **AI-Powered Conversations**: Discuss books with context-aware AI
- **Interactive Annotations**: Highlight text and add notes with organization
- **Learning Tools**: Quizzes, flashcards, and mind maps (in development)
- **Progress Tracking**: Cross-device reading progress synchronization

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **State Management**: React Context API
- **Routing**: React Router v6

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/genesis.git
cd genesis
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
./restart-dev.sh -f
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📁 Project Structure

src/
├── components/ # Reusable UI components
│ ├── book/ # Book-related components
│ ├── conversation/ # AI chat components
│ └── layout/ # Layout components
├── contexts/ # React context providers
├── pages/ # Main application pages
├── tests/ # Test files and mocks
└── utils/ # Utility functions


## 🎯 Development Status

- ✅ Book upload and management
- ✅ Reading interface with audio controls
- ✅ Annotation system
- ✅ AI conversation system
- 🚧 Voice synthesis (in progress)
- 🚧 Learning tools (quizzes, flashcards)
- 🚧 Content processing pipeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


