import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Quiz from '../../../components/learning/Quiz';
import { mockQuizzes } from '../../__mocks__/mockData';

// Mock functions
const mockOnQuizComplete = jest.fn();
const mockOnClose = jest.fn();

describe('Quiz Component', () => {
  const mockQuiz = mockQuizzes[0];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders quiz title and first question correctly', () => {
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Check quiz title
    expect(screen.getByText(mockQuiz.title)).toBeInTheDocument();
    
    // Check first question text
    expect(screen.getByText(mockQuiz.questions[0].question)).toBeInTheDocument();
    
    // Check answer options are rendered
    mockQuiz.questions[0].options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
    
    // Check progress indicator (1 of total questions)
    expect(screen.getByText(`Question 1 of ${mockQuiz.questions.length}`)).toBeInTheDocument();
  });
  
  test('allows selecting an answer option', () => {
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Select an answer
    fireEvent.click(screen.getByText(mockQuiz.questions[0].options[1]));
    
    // Check that option is selected (should have a different style)
    const selectedOption = screen.getByText(mockQuiz.questions[0].options[1]).closest('div');
    expect(selectedOption).toHaveClass('bg-blue-100'); // or whatever class indicates selection
  });
  
  test('navigates to next question after answering', async () => {
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Answer first question
    fireEvent.click(screen.getByText(mockQuiz.questions[0].options[1]));
    
    // Click next button
    fireEvent.click(screen.getByText('Next'));
    
    // Second question should now be visible
    await waitFor(() => {
      expect(screen.getByText(mockQuiz.questions[1].question)).toBeInTheDocument();
    });
    
    // Progress should be updated
    expect(screen.getByText(`Question 2 of ${mockQuiz.questions.length}`)).toBeInTheDocument();
  });
  
  test('shows results screen after answering all questions', async () => {
    render(
      <Quiz 
        quiz={{
          ...mockQuiz,
          questions: [mockQuiz.questions[0]] // Only use one question for simplicity
        }}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Answer the question
    fireEvent.click(screen.getByText(mockQuiz.questions[0].options[1]));
    
    // Click next/finish button
    fireEvent.click(screen.getByText('Finish'));
    
    // Results screen should appear
    await waitFor(() => {
      expect(screen.getByText(/Quiz Results/)).toBeInTheDocument();
    });
    
    // Should show score information
    expect(screen.getByText(/Your Score/)).toBeInTheDocument();
  });
  
  test('calculates score correctly', async () => {
    // Quiz with one question for simplicity
    const singleQuestionQuiz = {
      ...mockQuiz,
      questions: [mockQuiz.questions[0]]
    };
    
    render(
      <Quiz 
        quiz={singleQuestionQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Answer correctly (assuming correctAnswer index is 1)
    const correctAnswerIndex = singleQuestionQuiz.questions[0].correctAnswer;
    fireEvent.click(screen.getByText(singleQuestionQuiz.questions[0].options[correctAnswerIndex]));
    
    // Click finish button
    fireEvent.click(screen.getByText('Finish'));
    
    // Results screen should show 100% score
    await waitFor(() => {
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });
    
    // Check callback was called with correct score
    expect(mockOnQuizComplete).toHaveBeenCalledWith({
      score: 1,
      totalQuestions: 1,
      percentage: 100
    });
  });
  
  test('displays correct/incorrect feedback for answers', async () => {
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
        showFeedback={true} // Enable immediate feedback
      />
    );
    
    // Get the correct answer
    const correctAnswerIndex = mockQuiz.questions[0].correctAnswer;
    const correctAnswer = mockQuiz.questions[0].options[correctAnswerIndex];
    
    // Answer correctly
    fireEvent.click(screen.getByText(correctAnswer));
    
    // Should show correct feedback
    await waitFor(() => {
      const selectedOption = screen.getByText(correctAnswer).closest('div');
      expect(selectedOption).toHaveClass('bg-green-100'); // Correct answer highlight
    });
    
    // Click next
    fireEvent.click(screen.getByText('Next'));
    
    // Answer second question incorrectly (select option that's not the correct answer)
    const incorrectAnswerIndex = mockQuiz.questions[1].correctAnswer === 0 ? 1 : 0;
    const incorrectAnswer = mockQuiz.questions[1].options[incorrectAnswerIndex];
    fireEvent.click(screen.getByText(incorrectAnswer));
    
    // Should show incorrect feedback
    await waitFor(() => {
      const selectedOption = screen.getByText(incorrectAnswer).closest('div');
      expect(selectedOption).toHaveClass('bg-red-100'); // Incorrect answer highlight
    });
  });
  
  test('calls onClose when close button is clicked', () => {
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
      />
    );
    
    // Click close button
    fireEvent.click(screen.getByLabelText('Close quiz'));
    
    // onClose should be called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('timer counts down correctly', async () => {
    jest.useFakeTimers();
    
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
        timeLimit={60} // 60 seconds time limit
      />
    );
    
    // Initial timer should show 60 seconds
    expect(screen.getByText('60')).toBeInTheDocument();
    
    // Advance time by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Timer should now show 55 seconds
    await waitFor(() => {
      expect(screen.getByText('55')).toBeInTheDocument();
    });
    
    // Cleanup
    jest.useRealTimers();
  });
  
  test('submits quiz automatically when timer expires', async () => {
    jest.useFakeTimers();
    
    render(
      <Quiz 
        quiz={mockQuiz}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
        timeLimit={10} // 10 seconds time limit
      />
    );
    
    // Answer first question
    fireEvent.click(screen.getByText(mockQuiz.questions[0].options[0]));
    
    // Advance time to expiration
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Results screen should appear automatically
    await waitFor(() => {
      expect(screen.getByText(/Quiz Results/)).toBeInTheDocument();
    });
    
    // onQuizComplete should be called
    expect(mockOnQuizComplete).toHaveBeenCalled();
    
    // Cleanup
    jest.useRealTimers();
  });
  
  test('shows explanation for answers in review mode', async () => {
    render(
      <Quiz 
        quiz={{
          ...mockQuiz,
          questions: [{
            ...mockQuiz.questions[0],
            explanation: 'This is the explanation for the correct answer.'
          }]
        }}
        onQuizComplete={mockOnQuizComplete}
        onClose={mockOnClose}
        showExplanations={true}
      />
    );
    
    // Answer the question
    fireEvent.click(screen.getByText(mockQuiz.questions[0].options[0]));
    
    // Click finish
    fireEvent.click(screen.getByText('Finish'));
    
    // In the results screen, click "Review Answers"
    await waitFor(() => {
      fireEvent.click(screen.getByText('Review Answers'));
    });
    
    // Should show explanation
    expect(screen.getByText('This is the explanation for the correct answer.')).toBeInTheDocument();
  });
});
