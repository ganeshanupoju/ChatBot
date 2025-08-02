export class ChatbotService {
  private responses: Record<string, string[]> = {
    greeting: [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! What can I do for you?",
      "Welcome! I'm here to help. What would you like to know?",
    ],
    javascript: [
      "JavaScript is a versatile programming language. What specific aspect would you like to learn about?",
      "I'd be happy to help with JavaScript! Are you looking for help with syntax, concepts, or debugging?",
      "JavaScript can be tricky sometimes. What particular challenge are you facing?",
    ],
    nodejs: [
      "Node.js is great for server-side development! What would you like to know about it?",
      "Node.js allows you to run JavaScript on the server. Are you building an API or web application?",
      "I can help you with Node.js! What specific topic interests you?",
    ],
    express: [
      "Express.js is a fantastic web framework for Node.js! Here's a basic setup:\n\n```javascript\nconst express = require('express');\nconst app = express();\nconst port = 3000;\n\napp.get('/', (req, res) => {\n  res.send('Hello World!');\n});\n\napp.listen(port, () => {\n  console.log(`Server running on port ${port}`);\n});\n```",
      "Express makes building web servers easy! What specific feature do you need help with?",
    ],
    default: [
      "That's an interesting question! Can you provide more details?",
      "I understand. Let me help you with that.",
      "I'm here to assist! Could you elaborate on what you need?",
      "That's a great question! Here's what I think...",
      "I'd be happy to help! Can you tell me more about what you're looking for?",
    ],
  };

  generateResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (this.containsKeywords(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon'])) {
      return this.getRandomResponse('greeting');
    }
    
    if (this.containsKeywords(message, ['javascript', 'js'])) {
      return this.getRandomResponse('javascript');
    }
    
    if (this.containsKeywords(message, ['node', 'nodejs', 'node.js'])) {
      return this.getRandomResponse('nodejs');
    }
    
    if (this.containsKeywords(message, ['express', 'expressjs', 'express.js', 'server'])) {
      return this.getRandomResponse('express');
    }
    
    return this.getRandomResponse('default');
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const chatbotService = new ChatbotService();
