'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/types';
import { LocalStorageSessionRepository } from '@/lib/infrastructure/localStorageRepository';
import { SessionAggregate } from '@/lib/domain/session';
import SessionList from '@/components/SessionList';
import { useRouter } from 'next/navigation';

const repository = new LocalStorageSessionRepository();

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadSessions = async () => {
    const allSessions = await repository.findAll();
    setSessions(allSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleNewSession = async () => {
    const newSessionAgg = new SessionAggregate({ title: `Session ${sessions.length + 1}` });
    await repository.save(newSessionAgg.session);
    router.push(`/session/${newSessionAgg.session.id}`);
  };

  const handleDeleteSession = async (id: string) => {
    await repository.delete(id);
    await loadSessions();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <SessionList
        sessions={sessions}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}