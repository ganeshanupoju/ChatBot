import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Chat() {
  const { 
    isConnected, 
    messages, 
    isTyping, 
    error, 
    sendMessage, 
    clearError 
  } = useWebSocket();

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      <ChatHeader isConnected={isConnected} />
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput 
        onSendMessage={sendMessage}
        isConnected={isConnected}
        error={error}
        onClearError={clearError}
      />
    </div>
  );
}
