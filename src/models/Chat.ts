// src/models/Chat.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';

// Define a schema for a single message within the chat
const MessageSchema = new Schema({
  user: {
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  response: {
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
});

// Define the main schema for each chat document
const ChatSchema = new Schema({
  wa_id: { type: String, required: true },
  messages: [MessageSchema],
});

// Define a TypeScript interface for the Chat document
interface ChatDocument extends Document {
  wa_id: string;
  messages: {
    user: { message: string; timestamp: Date };
    response: { message: string; timestamp: Date };
  }[];
}

// Use a cached model to avoid recompiling in development
const Chat = models.Chat || model<ChatDocument>('Chat', ChatSchema);

export default Chat;
