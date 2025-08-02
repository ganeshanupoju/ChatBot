import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import type { Message } from "@shared/schema";
import { TypingIndicator } from "./typing-indicator";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessageContent = (content: string) => {
    // Check if content contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <div key={match.index} className="my-3">
          <div className="bg-gray-900 rounded-lg p-3 text-sm font-mono overflow-x-auto">
            <pre className="text-green-400">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="animate-[slideUp_0.3s_ease-out]">
          {message.sender === 'bot' ? (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs lg:max-w-lg">
                  <div className="text-gray-900 text-sm">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-2">
                  Bot • {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-indigo-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs lg:max-w-md">
                    <p className="text-white text-sm">{message.content}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="text-gray-600" size={16} />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-right mr-11">
                You • {formatTime(message.timestamp)}
              </p>
            </>
          )}
        </div>
      ))}
      
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
