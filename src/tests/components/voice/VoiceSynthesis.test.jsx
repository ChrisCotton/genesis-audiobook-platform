import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import VoiceSynthesis from '../../../components/voice/VoiceSynthesis';

describe('VoiceSynthesis Component', () => {
  const mockText = 'This is a test paragraph for voice synthesis. It should be read aloud.';
  const mockOnStart = jest.fn();
  const mockOnEnd = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnResume = jest.fn();
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock speechSynthesis.getVoices to return after a delay to test voice loading
    window.speechSynthesis.getVoices.mockImplementation(() => {
      return [
        { name: 'English Voice', lang: 'en-US', default: true },
        { name: 'Spanish Voice', lang: 'es-ES' },
        { name: 'French Voice', lang: 'fr-FR' }
      ];
    });
  });
  
  test('renders with initial controls', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
        onPause={mockOnPause}
        onResume={mockOnResume}
      />
    );
    
    // Basic controls should be rendered
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/voice/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pitch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
  });
  
  test('loads available voices correctly', async () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Check if voices are loaded in the dropdown
    const voiceSelect = screen.getByLabelText(/voice/i);
    
    // Wait for voices to load
    await waitFor(() => {
      expect(voiceSelect.options.length).toBe(3);
    });
    
    // Should contain the expected voices
    expect(voiceSelect.options[0].text).toContain('English Voice');
    expect(voiceSelect.options[1].text).toContain('Spanish Voice');
    expect(voiceSelect.options[2].text).toContain('French Voice');
  });
  
  test('plays text correctly when Play button is clicked', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Click play button
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // SpeechSynthesis.speak should be called
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    
    // onStart callback should be triggered
    expect(mockOnStart).toHaveBeenCalled();
    
    // Button should now be a pause button
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
  
  test('pauses and resumes playback correctly', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
        onPause={mockOnPause}
        onResume={mockOnResume}
      />
    );
    
    // Start playing
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    
    // Now pause
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(window.speechSynthesis.pause).toHaveBeenCalled();
    expect(mockOnPause).toHaveBeenCalled();
    
    // Button should now be a resume button
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    
    // Now resume
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    expect(window.speechSynthesis.resume).toHaveBeenCalled();
    expect(mockOnResume).toHaveBeenCalled();
    
    // Button should be a pause button again
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
  
  test('stops playback correctly', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Start playing
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Now stop
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    
    // Button should be a play button again
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
  
  test('changes voice correctly', async () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Wait for voices to load
    await waitFor(() => {
      expect(screen.getByLabelText(/voice/i).options.length).toBe(3);
    });
    
    // Change voice to Spanish
    fireEvent.change(screen.getByLabelText(/voice/i), { target: { value: '1' } }); // Second voice in array
    
    // Start playing with new voice
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Check if utterance was created with Spanish voice
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.voice.lang).toBe('es-ES');
  });
  
  test('adjusts speech rate correctly', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Change rate to 1.5x
    fireEvent.change(screen.getByLabelText(/speed/i), { target: { value: '1.5' } });
    
    // Start playing with new rate
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Check if utterance was created with adjusted rate
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.rate).toBe(1.5);
  });
  
  test('adjusts pitch correctly', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Change pitch to 1.2
    fireEvent.change(screen.getByLabelText(/pitch/i), { target: { value: '1.2' } });
    
    // Start playing with new pitch
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Check if utterance was created with adjusted pitch
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.pitch).toBe(1.2);
  });
  
  test('adjusts volume correctly', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Change volume to 0.7
    fireEvent.change(screen.getByLabelText(/volume/i), { target: { value: '0.7' } });
    
    // Start playing with new volume
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Check if utterance was created with adjusted volume
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.volume).toBe(0.7);
  });
  
  test('handles when speech synthesis is not supported', () => {
    // Temporarily remove speechSynthesis to simulate lack of support
    const originalSpeechSynthesis = window.speechSynthesis;
    delete window.speechSynthesis;
    
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Should show error message
    expect(screen.getByText(/speech synthesis is not supported in this browser/i)).toBeInTheDocument();
    
    // Restore speechSynthesis
    window.speechSynthesis = originalSpeechSynthesis;
  });
  
  test('triggers onEnd callback when speech completes', () => {
    render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Start playing
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Get the utterance object
    const utterance = window.speechSynthesis.speak.mock.calls[0][0];
    
    // Simulate end of speech
    act(() => {
      utterance.onend();
    });
    
    // onEnd callback should be triggered
    expect(mockOnEnd).toHaveBeenCalled();
    
    // Button should be a play button again
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
  
  test('handles long text by breaking into chunks', () => {
    // Create a very long text (longer than utterance limit)
    const longText = 'A'.repeat(5000);
    
    render(
      <VoiceSynthesis 
        text={longText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Start playing
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // SpeechSynthesis.speak should still be called (text gets chunked internally)
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
  
  test('updates when text prop changes', () => {
    const { rerender } = render(
      <VoiceSynthesis 
        text={mockText}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    // Start playing initial text
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Cancel should be called when text changes
    rerender(
      <VoiceSynthesis 
        text="This is new text content"
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      />
    );
    
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});