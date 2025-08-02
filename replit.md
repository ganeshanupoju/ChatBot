# AI Chat Application

## Overview

This is a real-time AI chatbot application built with a modern web stack. The application provides an interactive chat interface where users can communicate with an AI assistant through WebSocket connections. The frontend is built with React and Vite, featuring a clean UI powered by shadcn/ui components and Tailwind CSS. The backend uses Express.js with WebSocket support for real-time communication and includes a simple rule-based chatbot service that responds to user messages with contextual replies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components providing a comprehensive set of accessible, customizable React components
- **Styling**: Tailwind CSS for utility-first styling with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and data fetching
- **Real-time Communication**: WebSocket connection for live chat functionality

### Backend Architecture
- **Server Framework**: Express.js providing RESTful API capabilities
- **WebSocket Server**: Built-in WebSocket server for real-time bidirectional communication
- **Session Management**: UUID-based session tracking for chat conversations
- **Chatbot Service**: Rule-based AI assistant with keyword matching and contextual responses
- **Storage Layer**: In-memory storage implementation with interface for future database integration

### Data Storage Solutions
- **Current**: In-memory storage using Maps for users and messages
- **Configured**: Drizzle ORM with PostgreSQL schema definitions for future database migration
- **Database Schema**: Users table with authentication fields, Messages table with session tracking and timestamps

### Authentication and Authorization
- **Session Management**: UUID-based session identification for chat conversations
- **User Schema**: Prepared user authentication structure with username/password fields
- **Security**: Basic session isolation, ready for future authentication implementation

### External Dependencies
- **Database**: Neon Database serverless PostgreSQL (configured but not actively used)
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: ESBuild for production builds, TypeScript for type checking
- **Real-time**: Native WebSocket implementation for chat functionality
- **Styling**: PostCSS with Autoprefixer for CSS processing