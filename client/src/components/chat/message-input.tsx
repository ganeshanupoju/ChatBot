import { useState, useRef, useEffect } from "react";
import { Send, Smile, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  error: string | null;
  onClearError: () => void;
}

export function MessageInput({ onSendMessage, isConnected, error, onClearError }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isConnected || isLoading) return;

    setIsLoading(true);
    onClearError();
    
    try {
      onSendMessage(trimmedMessage);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="flex items-center">
            <Info className="mr-2" size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 max-h-32 overflow-y-auto"
              disabled={!isConnected || isLoading}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1"
              disabled={!isConnected}
            >
              <Smile size={18} />
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || !isConnected || isLoading}
          className="flex-shrink-0 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <div className="animate-spin">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Send size={18} />
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-2 flex items-center">
        <Info className="mr-1" size={12} />
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
