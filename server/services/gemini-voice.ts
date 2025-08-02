import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventEmitter } from "events";

export interface VoiceMessage {
  type: 'audio' | 'text' | 'error' | 'turn_complete' | 'interruption_started';
  data?: any;
  audio?: string; // base64 encoded audio
  text?: string;
  sessionId?: string;
}

export class GeminiVoiceService extends EventEmitter {
  private genAI: GoogleGenerativeAI;
  private sessions: Map<string, { model: any; history: any[] }> = new Map();

  constructor() {
    super();
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async createSession(sessionId: string): Promise<void> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: this.getSystemInstructions(),
      });

      this.sessions.set(sessionId, {
        model,
        history: []
      });

      console.log(`Session ${sessionId} created`);
      this.emit('sessionReady', sessionId);

    } catch (error) {
      console.error(`Failed to create session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendText(sessionId: string, text: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const chat = session.model.startChat({
        history: session.history,
      });

      const result = await chat.sendMessage(text);
      const response = result.response.text();

      // Update history
      session.history.push(
        { role: "user", parts: [{ text }] },
        { role: "model", parts: [{ text: response }] }
      );

      this.emit('textResponse', {
        type: 'text',
        text: response,
        sessionId
      });

      return response;
    } catch (error) {
      console.error(`Failed to send text for session ${sessionId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
      this.emit('error', {
        type: 'error',
        data: errorMessage,
        sessionId
      });
      throw error;
    }
  }

  async processAudioText(sessionId: string, transcribedText: string): Promise<string> {
    return this.sendText(sessionId, transcribedText);
  }

  async closeSession(sessionId: string): Promise<void> {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      console.log(`Session ${sessionId} closed`);
    }
  }

  private getSystemInstructions(): string {
    return `You are Rev, the AI assistant for Revolt Motors, an innovative electric motorcycle company.

    About Revolt Motors:
    - Revolt Motors is India's first AI-enabled electric motorcycle company
    - We manufacture smart, connected electric motorcycles with cutting-edge technology
    - Our flagship models include the RV400 and RV1+
    - We focus on sustainable mobility solutions for urban transportation
    - Key features: AI integration, mobile app connectivity, swappable batteries, smart dashboard
    
    Your role:
    - Answer questions about Revolt Motors products, features, and services
    - Provide information about electric motorcycles, sustainability, and smart mobility
    - Help customers understand our technology and product benefits
    - Maintain an enthusiastic but professional tone
    - Keep responses concise and conversational for voice interaction
    - If asked about topics unrelated to Revolt Motors or electric vehicles, politely redirect the conversation back to our products and services
    
    Important:
    - Always respond in a natural, conversational tone suitable for voice interaction
    - Keep responses under 30 seconds when spoken
    - Be helpful and informative about Revolt Motors specifically`;
  }

  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}

export const geminiVoiceService = new GeminiVoiceService();