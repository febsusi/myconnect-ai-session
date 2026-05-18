import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';

export class MessageEntity {
  static create(role: 'user' | 'assistant', content: string): Message {
    return {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };
  }
}