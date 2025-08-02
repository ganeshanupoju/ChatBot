import { Settings, MoreVertical, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isConnected: boolean;
}

export function ChatHeader({ isConnected }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-500 flex items-center">
            <span 
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            {isConnected ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
          <Settings size={18} />
        </Button>
        <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
          <MoreVertical size={18} />
        </Button>
      </div>
    </header>
  );
}
