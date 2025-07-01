import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function AIChat({ bookId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Simulated AI response data based on the book
  const aiResponses = {
    '1': {
      // Innovator's Dilemma
      'concept': "The main concept in this book is 'disruptive innovation', which describes how smaller companies with fewer resources can successfully challenge established businesses by targeting overlooked segments and then moving upmarket.",
      'examples': "The book provides several examples, including the disk drive industry, mechanical excavators, and steel mini-mills. In each case, established companies focused on their most profitable customers while startups began serving less profitable segments before gradually moving upmarket.",
      'summary': "The Innovator's Dilemma explains why leading companies often fail when facing disruptive technologies, even when making seemingly rational decisions. Christensen distinguishes between sustaining innovations (which improve existing products) and disruptive innovations (which initially underperform but appeal to new or less-demanding customers).",
      'author': "Clayton Christensen was a Harvard Business School professor who specialized in innovation and growth. He wrote several influential books on business innovation and was named the world's most influential business thinker by Thinkers50.",
      'fallback': "I can help you understand key concepts from The Innovator's Dilemma. You can ask about the main thesis, examples of disruption, practical applications, or how to identify disruptive innovations in your industry."
    },
    '2': {
      // Thinking, Fast and Slow
      'concept': "Kahneman presents a dual-system model of thinking: System 1 (fast, intuitive, emotional) and System 2 (slow, deliberate, logical). Many cognitive biases arise from System 1's shortcuts.",
      'examples': "The book discusses numerous cognitive biases, including anchoring, availability heuristic, substitution, loss aversion, and the planning fallacy. For example, the anchoring effect describes how initial information disproportionately influences subsequent judgments.",
      'summary': "Thinking, Fast and Slow explores how our minds work and the systematic errors in human judgment. Kahneman challenges the assumption of human rationality and explains how cognitive biases affect our decisions in both professional and personal contexts.",
      'author': "Daniel Kahneman is a psychologist notable for his work on the psychology of judgment and decision-making, as well as behavioral economics. He was awarded the 2002 Nobel Prize in Economics for his pioneering work with Amos Tversky.",
      'fallback': "I can help explain concepts from Thinking, Fast and Slow. Feel free to ask about specific cognitive biases, the difference between System 1 and System 2 thinking, or how these concepts apply to everyday decision-making."
    },
    '3': {
      // Atomic Habits
      'concept': "The core concept is that tiny changes can lead to remarkable results over time. Clear introduces a four-step model for habit formation: cue, craving, response, and reward.",
      'examples': "Clear provides examples like the British cycling team that made 1% improvements in various areas, leading to remarkable overall performance improvements. He also discusses habit stacking, environment design, and implementation intentions.",
      'summary': "Atomic Habits presents practical strategies for forming good habits and breaking bad ones. Clear argues that focusing on systems rather than goals and making small, consistent improvements is the path to remarkable results.",
      'author': "James Clear is an author and entrepreneur known for his focus on habits, decision-making, and continuous improvement. His work combines ideas from biology, neuroscience, philosophy, and psychology.",
      'fallback': "I can help explain concepts from Atomic Habits. You might want to ask about the habit loop, identity-based habits, the plateau of latent potential, or specific strategies for building better habits."
    },
    '4': {
      // Psychology of Money
      'concept': "The book argues that financial decisions are not made in a spreadsheet but in our minds, influenced by our unique experiences, worldview, ego, pride, marketing, and odd incentives.",
      'examples': "Housel shares stories like that of Ronald Read, a janitor who amassed an $8 million fortune through patience and long-term investing, contrasted with Richard Fuscone, a Harvard-educated executive who went bankrupt.",
      'summary': "The Psychology of Money explores how our relationship with money is influenced by psychology rather than pure mathematics. Housel emphasizes that financial success isn't necessarily about what you know, but how you behave.",
      'author': "Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal. He's known for his insights on behavioral finance and investing psychology.",
      'fallback': "I can help explain concepts from The Psychology of Money. Feel free to ask about specific stories from the book, the concept of room for error, the difference between being rich vs. wealthy, or long-term investing philosophy."
    }
  };

  // Initial greeting message when component mounts
  useEffect(() => {
    const book = bookId in aiResponses ? aiResponses[bookId] : aiResponses['1'];
    const initialMessage = {
      id: 'initial',
      sender: 'ai',
      text: `Hello! I'm your Genesis AI assistant. I can help you understand the concepts in this book, answer questions about the content, provide summaries, or facilitate deeper learning. What would you like to know?`,
      timestamp: new Date().toISOString()
    };
    
    setMessages([initialMessage]);
  }, [bookId]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI thinking/responding
    setTimeout(() => {
      generateAIResponse(inputValue);
      setIsTyping(false);
    }, 1500);
  };

  // Generate a simulated AI response based on user input
  const generateAIResponse = (userInput) => {
    const book = bookId in aiResponses ? aiResponses[bookId] : aiResponses['1'];
    const input = userInput.toLowerCase();
    
    let responseText = '';
    
    // Check for keywords to determine appropriate response
    if (input.includes('concept') || input.includes('main idea') || input.includes('about')) {
      responseText = book.concept;
    } 
    else if (input.includes('example') || input.includes('case study')) {
      responseText = book.examples;
    } 
    else if (input.includes('summary') || input.includes('summarize')) {
      responseText = book.summary;
    } 
    else if (input.includes('author') || input.includes('who wrote')) {
      responseText = book.author;
    } 
    else {
      responseText = book.fallback;
    }
    
    const aiMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Genesis AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by book content</p>
          </div>
        </div>
      </div>

      {/* Chat messages container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 rounded-bl-none max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask anything about the book..."
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className={`bg-blue-600 text-white rounded-lg px-4 py-2 ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          <p>Try asking: "What is the main concept?", "Give me examples", "Who is the author?"</p>
        </div>
      </div>
    </div>
  );
}

AIChat.propTypes = {
  bookId: PropTypes.string.isRequired
};

export default AIChat;