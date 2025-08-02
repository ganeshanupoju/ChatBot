import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '@shared/schema';

export interface WebSocketMessage {
  type: 'message' | 'error' | 'typing';
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'message':
              setMessages(prev => [...prev, message.data]);
              setIsTyping(false);
              break;
            case 'error':
              setError(message.data.message);
              setIsTyping(false);
              break;
            case 'typing':
              setIsTyping(message.data.isTyping);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsTyping(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to establish connection');
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'message',
        data: { content }
      }));
      setError(null);
    } else {
      setError('Not connected to server');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    isTyping,
    error,
    sendMessage,
    clearError: () => setError(null),
  };
}
