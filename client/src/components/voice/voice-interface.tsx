import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoice } from "@/hooks/use-voice";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Card } from "@/components/ui/card";

interface VoiceInterfaceProps {
  onVoiceMessage: (transcribedText: string) => void;
  onInterrupt: () => void;
  isConnected: boolean;
  shouldSpeak?: boolean;
  lastBotMessage?: string;
  onToggleMode: () => void;
  isVoiceMode: boolean;
}

export function VoiceInterface({ 
  onVoiceMessage, 
  onInterrupt, 
  isConnected, 
  shouldSpeak, 
  lastBotMessage,
  onToggleMode,
  isVoiceMode 
}: VoiceInterfaceProps) {
  const voice = useVoice();
  const tts = useTextToSpeech();
  const [transcribedText, setTranscribedText] = useState("");

  // Handle text-to-speech for bot responses
  useEffect(() => {
    if (shouldSpeak && lastBotMessage && isVoiceMode) {
      tts.speak(lastBotMessage);
    }
  }, [shouldSpeak, lastBotMessage, isVoiceMode, tts]);

  const handleStartRecording = async () => {
    if (tts.isSpeaking) {
      tts.stop();
      onInterrupt();
    }
    
    await voice.startRecording();
  };

  const handleStopRecording = () => {
    voice.stopRecording();
  };

  // Enhanced voice recording with speech recognition
  const handleVoiceRecording = async () => {
    if (voice.isRecording) {
      handleStopRecording();
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      try {
        // Stop any current TTS and interrupt
        if (tts.isSpeaking) {
          tts.stop();
          onInterrupt();
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let isRecognizing = false;

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setTranscribedText("");
          isRecognizing = true;
          // Manually set recording state
          voice.setState?.(prev => ({ ...prev, isRecording: true, error: null }));
        };

        recognition.onresult = (event: any) => {
          console.log('Speech recognition result:', event);
          if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);
            setTranscribedText(transcript);
            onVoiceMessage(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          isRecognizing = false;
          voice.setState?.(prev => ({ 
            ...prev, 
            isRecording: false, 
            error: `Voice recognition error: ${event.error}. Please try again.` 
          }));
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          isRecognizing = false;
          voice.setState?.(prev => ({ ...prev, isRecording: false }));
        };

        recognition.start();
        
        // Fallback timeout to stop recording after 10 seconds
        setTimeout(() => {
          if (isRecognizing) {
            recognition.stop();
          }
        }, 10000);

      } catch (error) {
        console.error('Speech recognition setup error:', error);
        voice.setState?.(prev => ({ 
          ...prev, 
          error: 'Failed to start voice recognition. Please check your microphone permissions.' 
        }));
      }
    }
  };

  if (!isVoiceMode) {
    return (
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={onToggleMode}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-4 shadow-lg"
          size="lg"
        >
          <Mic className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-t border-gray-200 bg-white px-6 py-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <Button
          onClick={onToggleMode}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Text Mode
        </Button>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center justify-center space-x-6">
        {/* Record Button */}
        <Button
          onClick={handleVoiceRecording}
          disabled={!isConnected || voice.isProcessing}
          className={`w-16 h-16 rounded-full transition-all duration-200 ${
            voice.isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {voice.isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>

        {/* TTS Control */}
        <Button
          onClick={tts.isSpeaking ? tts.stop : undefined}
          disabled={!tts.isSpeaking}
          variant="outline"
          className="w-12 h-12 rounded-full"
        >
          {tts.isSpeaking ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Status Messages */}
      <div className="mt-4 text-center">
        {voice.isRecording && (
          <p className="text-red-600 text-sm font-medium animate-pulse">
            🎤 Listening... Tap to stop
          </p>
        )}
        
        {voice.isProcessing && (
          <p className="text-blue-600 text-sm">
            Processing...
          </p>
        )}
        
        {tts.isSpeaking && (
          <p className="text-green-600 text-sm font-medium">
            🔊 Speaking... Tap mic to interrupt
          </p>
        )}
        
        {!voice.isRecording && !voice.isProcessing && !tts.isSpeaking && (
          <p className="text-gray-500 text-sm">
            Tap the microphone to start talking
          </p>
        )}

        {transcribedText && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>You said:</strong> {transcribedText}
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {voice.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {voice.error}
          <Button onClick={voice.clearError} variant="ghost" size="sm" className="ml-2">
            Dismiss
          </Button>
        </div>
      )}

      {tts.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {tts.error}
          <Button onClick={tts.clearError} variant="ghost" size="sm" className="ml-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        <p>• Hold microphone to record voice messages</p>
        <p>• AI will speak responses automatically</p>
        <p>• Tap microphone while AI is speaking to interrupt</p>
      </div>
    </Card>
  );
}