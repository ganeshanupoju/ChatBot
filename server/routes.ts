import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { chatbotService } from "./services/chatbot";
import { insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active WebSocket connections with session IDs
  const connections = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    const sessionId = randomUUID();
    connections.set(sessionId, ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'message',
      data: {
        id: randomUUID(),
        content: "Hello! I'm your AI assistant. How can I help you today?",
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

          // Generate bot response
          const botResponse = chatbotService.generateResponse(content);
          
          // Store bot message
          const botMessage = await storage.createMessage({
            content: botResponse,
            sender: 'bot',
            sessionId,
          });

          // Send bot response after a delay to simulate thinking
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'message',
                data: botMessage
              }));
            }
          }, 1000 + Math.random() * 2000); // 1-3 second delay
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

    ws.on('close', () => {
      connections.delete(sessionId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(sessionId);
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
