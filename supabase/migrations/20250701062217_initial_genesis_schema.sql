-- Genesis Platform Initial Schema Migration
-- This creates all the core tables needed for the interactive audiobook platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table - Core book metadata and content
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT, -- Original uploaded file
    file_type VARCHAR(20), -- pdf, epub, mobi, txt, docx
    language VARCHAR(10) DEFAULT 'en',
    pages INTEGER,
    word_count INTEGER,
    reading_level VARCHAR(20), -- beginner, intermediate, advanced
    tags TEXT[], -- Array of tags
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table - Book content organization
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    chapter_number INTEGER NOT NULL,
    content TEXT NOT NULL, -- Full chapter text
    word_count INTEGER,
    estimated_reading_time INTEGER, -- in minutes
    audio_url TEXT, -- Generated TTS audio file
    audio_duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, chapter_number)
);

-- User reading progress
CREATE TABLE reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    paragraph_index INTEGER DEFAULT 0,
    character_position INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    reading_mode VARCHAR(20) DEFAULT 'text', -- text, audio, synchronized
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_reading_time INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Annotations and highlights
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_position INTEGER NOT NULL, -- Character position in chapter
    end_position INTEGER NOT NULL,
    selected_text TEXT NOT NULL,
    note_text TEXT,
    highlight_color VARCHAR(20) DEFAULT 'yellow',
    annotation_type VARCHAR(20) DEFAULT 'highlight', -- highlight, note, bookmark
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    conversation_type VARCHAR(20) DEFAULT 'general', -- general, character, analysis, learning
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual messages in conversations
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, ai, system
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, audio, image
    metadata JSONB, -- Additional data like audio duration, image URLs, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes and assessments
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_type VARCHAR(20) DEFAULT 'comprehension', -- comprehension, vocabulary, analysis
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    time_limit INTEGER, -- in minutes
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    options JSONB, -- Array of answer options for multiple choice
    correct_answer JSONB NOT NULL, -- Correct answer(s)
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quiz attempts and scores
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- User's answers
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary management
CREATE TABLE vocabulary_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(10) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual vocabulary words
CREATE TABLE vocabulary_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vocabulary_list_id UUID REFERENCES vocabulary_lists(id) ON DELETE CASCADE,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    pronunciation TEXT,
    example_sentence TEXT,
    context_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    word_type VARCHAR(20), -- noun, verb, adjective, etc.
    is_learned BOOLEAN DEFAULT false,
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    language_preference VARCHAR(10) DEFAULT 'en',
    reading_speed INTEGER DEFAULT 250, -- words per minute
    font_size VARCHAR(20) DEFAULT 'medium',
    font_family VARCHAR(50) DEFAULT 'system',
    theme VARCHAR(20) DEFAULT 'light',
    voice_preference VARCHAR(50) DEFAULT 'default',
    voice_speed DECIMAL(3,2) DEFAULT 1.00,
    voice_pitch DECIMAL(3,2) DEFAULT 1.00,
    auto_play_audio BOOLEAN DEFAULT false,
    highlight_while_reading BOOLEAN DEFAULT true,
    learning_level VARCHAR(20) DEFAULT 'intermediate',
    daily_reading_goal INTEGER DEFAULT 30, -- minutes
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics and progress tracking
CREATE TABLE learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    session_date DATE DEFAULT CURRENT_DATE,
    reading_time INTEGER DEFAULT 0, -- in seconds
    words_read INTEGER DEFAULT 0,
    pages_read INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5,2) DEFAULT 0.00,
    annotations_created INTEGER DEFAULT 0,
    vocabulary_added INTEGER DEFAULT 0,
    ai_interactions INTEGER DEFAULT 0,
    reading_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id, session_date)
);

-- Audio files and TTS management
CREATE TABLE audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    duration INTEGER NOT NULL, -- in seconds
    voice_name VARCHAR(50) NOT NULL,
    voice_settings JSONB, -- speed, pitch, etc.
    processing_status VARCHAR(20) DEFAULT 'completed', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mind maps and visual learning aids
CREATE TABLE mind_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    map_data JSONB NOT NULL, -- Node and connection data
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_language ON books(language);
CREATE INDEX idx_books_upload_date ON books(upload_date);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_annotations_user_book ON annotations(user_id, book_id);
CREATE INDEX idx_annotations_chapter ON annotations(chapter_id);
CREATE INDEX idx_conversations_user_book ON conversations(user_id, book_id);
CREATE INDEX idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX idx_quizzes_book_id ON quizzes(book_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_vocabulary_lists_user_book ON vocabulary_lists(user_id, book_id);
CREATE INDEX idx_vocabulary_words_list ON vocabulary_words(vocabulary_list_id);
CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, session_date);
CREATE INDEX idx_audio_files_chapter ON audio_files(chapter_id);
CREATE INDEX idx_mind_maps_user_book ON mind_maps(user_id, book_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_lists_updated_at BEFORE UPDATE ON vocabulary_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_words_updated_at BEFORE UPDATE ON vocabulary_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_analytics_updated_at BEFORE UPDATE ON learning_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mind_maps_updated_at BEFORE UPDATE ON mind_maps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
-- Books policies
CREATE POLICY "Users can view their own books" ON books
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own books" ON books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON books
    FOR DELETE USING (auth.uid() = user_id);

-- Chapters policies (inherit from books)
CREATE POLICY "Users can view chapters of accessible books" ON chapters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM books 
            WHERE books.id = chapters.book_id 
            AND (books.user_id = auth.uid() OR books.is_public = true)
        )
    );

-- Reading progress policies
CREATE POLICY "Users can manage their own reading progress" ON reading_progress
    FOR ALL USING (auth.uid() = user_id);

-- Annotations policies
CREATE POLICY "Users can view their own annotations and public ones" ON annotations
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own annotations" ON annotations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations" ON annotations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations" ON annotations
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can manage their own conversations" ON conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversation messages" ON conversation_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = conversation_messages.conversation_id 
            AND conversations.user_id = auth.uid()
        )
    );

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Learning analytics policies
CREATE POLICY "Users can view their own analytics" ON learning_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Comment explaining the schema
COMMENT ON TABLE books IS 'Core book metadata and file information';
COMMENT ON TABLE chapters IS 'Individual chapters/sections within books';
COMMENT ON TABLE reading_progress IS 'Tracks user reading position and progress';
COMMENT ON TABLE annotations IS 'User highlights, notes, and bookmarks';
COMMENT ON TABLE conversations IS 'AI conversation sessions';
COMMENT ON TABLE conversation_messages IS 'Individual messages in AI conversations';
COMMENT ON TABLE quizzes IS 'Learning assessments and comprehension tests';
COMMENT ON TABLE quiz_questions IS 'Individual questions within quizzes';
COMMENT ON TABLE quiz_attempts IS 'User quiz submissions and scores';
COMMENT ON TABLE vocabulary_lists IS 'Collections of vocabulary words';
COMMENT ON TABLE vocabulary_words IS 'Individual vocabulary entries with definitions';
COMMENT ON TABLE user_preferences IS 'User settings and preferences';
COMMENT ON TABLE learning_analytics IS 'Learning progress and engagement metrics';
COMMENT ON TABLE audio_files IS 'Generated TTS audio files for chapters';
COMMENT ON TABLE mind_maps IS 'Visual learning aids and concept maps';
