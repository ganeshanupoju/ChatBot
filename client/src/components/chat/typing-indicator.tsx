import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
        <Bot className="text-white" size={16} />
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-2">Bot is typing...</p>
      </div>
    </div>
  );
}
