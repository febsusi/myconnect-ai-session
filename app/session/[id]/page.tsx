'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Session } from '@/types';
import { SessionAggregate } from '@/lib/domain/session';
import { MessageEntity } from '@/lib/domain/message';
import { LocalStorageSessionRepository } from '@/lib/infrastructure/localStorageRepository';
import SessionDetail from '@/components/SessionDetail';

const repository = new LocalStorageSessionRepository();

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    const id = params.id as string;
    const found = await repository.findById(id);
    if (!found) {
      router.push('/');
      return;
    }
    setSession(found);
    setLoading(false);
  };

  useEffect(() => {
    loadSession();
  }, [params.id]);

  const handleAddMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!session) return;

    const newMessage = MessageEntity.create(role, content);
    const sessionAgg = new SessionAggregate(session);
    sessionAgg.addMessage(newMessage);
    
    if (session.messages.length === 0 && role === 'user') {
      const title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      sessionAgg.updateTitle(title);
    }
    
    await repository.save(sessionAgg.session);
    setSession(sessionAgg.session);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Session not found</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <button
          onClick={() => router.push('/')}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 mb-2 inline-block"
        >
          ← Back to sessions
        </button>
        <h2 className="text-2xl font-bold">{session.title}</h2>
      </div>
      <SessionDetail session={session} onAddMessage={handleAddMessage} />
    </div>
  );
}
