import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { geminiVoiceService } from "./services/gemini-voice";
import { insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections with session IDs
  const connections = new Map<string, WebSocket>();

  wss.on('connection', async (ws) => {
    const sessionId = randomUUID();
    connections.set(sessionId, ws);

    // Initialize Gemini session
    try {
      await geminiVoiceService.createSession(sessionId);
    } catch (error) {
      console.error('Failed to create Gemini session:', error);
    }

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'message',
      data: {
        id: randomUUID(),
        content: "Hello! I'm Rev, your Revolt Motors AI assistant. How can I help you with our electric motorcycles today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sessionId,
      }
    }));

    ws.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        
        if (parsed.type === 'message') {
          const { content } = parsed.data;
          
          // Validate message
          const validatedMessage = insertMessageSchema.parse({
            content,
            sender: 'user',
            sessionId,
          });

          // Store user message
          const userMessage = await storage.createMessage(validatedMessage);

          // Broadcast user message
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'message',
              data: userMessage
            }));
          }

          // Generate bot response using Gemini
          try {
            const botResponse = await geminiVoiceService.sendText(sessionId, content);
            
            // Store bot message
            const botMessage = await storage.createMessage({
              content: botResponse,
              sender: 'bot',
              sessionId,
            });

            // Send bot response after a short delay
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'message',
                  data: botMessage
                }));
              }
            }, 500 + Math.random() * 1000); // 0.5-1.5 second delay
          } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback response
            const fallbackMessage = await storage.createMessage({
              content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
              sender: 'bot',
              sessionId,
            });

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'message',
                data: fallbackMessage
              }));
            }
          }
        } else if (parsed.type === 'voice_message') {
          const { transcribedText } = parsed.data;
          
          if (transcribedText) {
            // Process voice message same as text message
            const validatedMessage = insertMessageSchema.parse({
              content: transcribedText,
              sender: 'user',
              sessionId,
            });

            const userMessage = await storage.createMessage(validatedMessage);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'message',
                data: userMessage
              }));
            }

            try {
              const botResponse = await geminiVoiceService.processAudioText(sessionId, transcribedText);
              
              const botMessage = await storage.createMessage({
                content: botResponse,
                sender: 'bot',
                sessionId,
              });

              setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({
                    type: 'voice_response',
                    data: { ...botMessage, shouldSpeak: true }
                  }));
                }
              }, 300 + Math.random() * 700);
            } catch (error) {
              console.error('Voice processing error:', error);
            }
          }
        } else if (parsed.type === 'interrupt') {
          // Handle interruption
          ws.send(JSON.stringify({
            type: 'interrupted',
            data: { sessionId }
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Failed to process message' }
          }));
        }
      }
    });

    ws.on('close', async () => {
      connections.delete(sessionId);
      await geminiVoiceService.closeSession(sessionId);
    });

    ws.on('error', async (error) => {
      console.error('WebSocket error:', error);
      connections.delete(sessionId);
      await geminiVoiceService.closeSession(sessionId);
    });
  });

  // REST API endpoints
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.get('/api/messages/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Failed to fetch session messages:', error);
      res.status(500).json({ message: 'Failed to fetch session messages' });
    }
  });

  return httpServer;
}
