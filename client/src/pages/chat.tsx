import { useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { VoiceInterface } from "@/components/voice/voice-interface";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Chat() {
  const { 
    isConnected, 
    messages, 
    isTyping, 
    error, 
    lastBotMessage,
    shouldSpeak,
    sendMessage, 
    sendVoiceMessage,
    sendInterrupt,
    clearError 
  } = useWebSocket();

  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const toggleMode = () => {
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      <ChatHeader isConnected={isConnected} />
      <MessageList messages={messages} isTyping={isTyping} />
      
      {isVoiceMode ? (
        <VoiceInterface
          onVoiceMessage={sendVoiceMessage}
          onInterrupt={sendInterrupt}
          isConnected={isConnected}
          shouldSpeak={shouldSpeak}
          lastBotMessage={lastBotMessage}
          onToggleMode={toggleMode}
          isVoiceMode={isVoiceMode}
        />
      ) : (
        <>
          <MessageInput 
            onSendMessage={sendMessage}
            isConnected={isConnected}
            error={error}
            onClearError={clearError}
          />
          <VoiceInterface
            onVoiceMessage={sendVoiceMessage}
            onInterrupt={sendInterrupt}
            isConnected={isConnected}
            shouldSpeak={shouldSpeak}
            lastBotMessage={lastBotMessage}
            onToggleMode={toggleMode}
            isVoiceMode={isVoiceMode}
          />
        </>
      )}
    </div>
  );
}
