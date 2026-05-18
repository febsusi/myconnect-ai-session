import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export class SessionAggregate {
  private _session: Session;

  constructor(session?: Partial<Session>) {
    this._session = {
      id: session?.id || uuidv4(),
      title: session?.title || 'New Session',
      createdAt: session?.createdAt || new Date(),
      updatedAt: session?.updatedAt || new Date(),
      messages: session?.messages || [],
    };
  }

  get session(): Session {
    return { ...this._session };
  }

  addMessage(message: Message): void {
    this._session.messages.push(message);
    this._session.updatedAt = new Date();
  }

  updateTitle(title: string): void {
    this._session.title = title;
    this._session.updatedAt = new Date();
  }
}