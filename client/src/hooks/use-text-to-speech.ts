import { useState, useRef, useCallback } from 'react';

export interface TextToSpeechState {
  isSpeaking: boolean;
  canSpeak: boolean;
  error: string | null;
}

export function useTextToSpeech() {
  const [state, setState] = useState<TextToSpeechState>({
    isSpeaking: false,
    canSpeak: 'speechSynthesis' in window,
    error: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }) => {
    if (!state.canSpeak) {
      setState(prev => ({ ...prev, error: 'Text-to-speech not supported' }));
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure speech options
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;
    
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a natural-sounding English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Natural') || voice.name.includes('Enhanced'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, error: null }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        error: `Speech error: ${event.error}` 
      }));
    };

    window.speechSynthesis.speak(utterance);
  }, [state.canSpeak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const getVoices = useCallback(() => {
    return window.speechSynthesis.getVoices();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    speak,
    stop,
    pause,
    resume,
    getVoices,
    clearError,
  };
}