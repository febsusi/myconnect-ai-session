import { Session, Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const loadSessions = (): Session[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('ai_sessions');
  if (!raw) return [];
  const sessions = JSON.parse(raw);
  return sessions.map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
    messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
  }));
};

const saveSessions = (sessions: Session[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ai_sessions', JSON.stringify(sessions));
};

export const getSessions = (): Session[] => loadSessions();

export const getSession = (id: string): Session | null => {
  return loadSessions().find(s => s.id === id) || null;
};

export const createSession = (title?: string): Session => {
  const newSession: Session = {
    id: uuidv4(),
    title: title || 'New Session',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  };
  const sessions = loadSessions();
  saveSessions([newSession, ...sessions]);
  return newSession;
};

export const addMessageToSession = (sessionId: string, content: string, role: 'user' | 'assistant'): Session | null => {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index === -1) return null;
  
  const newMessage: Message = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
  };
  
  sessions[index].messages.push(newMessage);
  sessions[index].updatedAt = new Date();
  
  if (sessions[index].messages.length === 1 && role === 'user') {
    sessions[index].title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
  }
  
  saveSessions(sessions);
  return sessions[index];
};

export const deleteSession = (id: string): void => {
  const sessions = loadSessions();
  saveSessions(sessions.filter(s => s.id !== id));
};
