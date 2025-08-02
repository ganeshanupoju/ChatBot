import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Card } from "@/components/ui/card";

interface SimpleVoiceInterfaceProps {
  onVoiceMessage: (transcribedText: string) => void;
  onInterrupt: () => void;
  isConnected: boolean;
  shouldSpeak?: boolean;
  lastBotMessage?: string;
  onToggleMode: () => void;
  isVoiceMode: boolean;
}

export function SimpleVoiceInterface({ 
  onVoiceMessage, 
  onInterrupt, 
  isConnected, 
  shouldSpeak, 
  lastBotMessage,
  onToggleMode,
  isVoiceMode 
}: SimpleVoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const tts = useTextToSpeech();

  // Handle text-to-speech for bot responses
  useEffect(() => {
    if (shouldSpeak && lastBotMessage && isVoiceMode) {
      tts.speak(lastBotMessage, { rate: 1.1, pitch: 1.0 });
    }
  }, [shouldSpeak, lastBotMessage, isVoiceMode, tts]);

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
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
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setError(null);
        setTranscribedText("");
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event);
        if (event.results && event.results[0]) {
          const transcript = event.results[0][0].transcript.trim();
          console.log('Transcript:', transcript);
          setTranscribedText(transcript);
          if (transcript) {
            onVoiceMessage(transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error !== 'aborted') {
          setError(`Voice recognition error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };

      recognition.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setError('Failed to start voice recognition. Please check your microphone permissions.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
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
            {isConnected ? 'Connected to Rev' : 'Disconnected'}
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
          onClick={handleVoiceClick}
          disabled={!isConnected}
          className={`w-16 h-16 rounded-full transition-all duration-200 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {isRecording ? (
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
            <VolumeX className="w-6 h-6 text-red-500" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Status Messages */}
      <div className="mt-4 text-center">
        {isRecording && (
          <p className="text-red-600 text-sm font-medium">
            🎤 Listening... Click to stop
          </p>
        )}
        
        {tts.isSpeaking && (
          <p className="text-green-600 text-sm font-medium">
            🔊 Rev is speaking... Click mic to interrupt
          </p>
        )}
        
        {!isRecording && !tts.isSpeaking && (
          <p className="text-gray-500 text-sm">
            Click the microphone to talk to Rev
          </p>
        )}

        {transcribedText && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>You said:</strong> "{transcribedText}"
            </p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <Button onClick={() => setError(null)} variant="ghost" size="sm" className="ml-2">
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
        <p>• Click microphone to start talking about Revolt Motors</p>
        <p>• Rev will respond automatically with voice</p>
        <p>• Click microphone while Rev speaks to interrupt</p>
      </div>
    </Card>
  );
}