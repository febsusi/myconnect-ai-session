import { SessionRepository } from '@/lib/domain/repository';
import { Session } from '@/types';

const STORAGE_KEY = 'ai_sessions';

export class LocalStorageSessionRepository implements SessionRepository {
  private loadSessions(): Session[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    return sessions.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  }

  private saveSessions(sessions: Session[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  async findAll(): Promise<Session[]> {
    return this.loadSessions();
  }

  async findById(id: string): Promise<Session | null> {
    const sessions = this.loadSessions();
    return sessions.find(s => s.id === id) || null;
  }

  async save(session: Session): Promise<void> {
    const sessions = this.loadSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    this.saveSessions(sessions);
  }

  async delete(id: string): Promise<void> {
    const sessions = this.loadSessions();
    const filtered = sessions.filter(s => s.id !== id);
    this.saveSessions(filtered);
  }
}