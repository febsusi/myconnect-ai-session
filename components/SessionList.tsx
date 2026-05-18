'use client';

import { Session } from '@/types';
import Link from 'next/link';

interface SessionListProps {
  sessions: Session[];
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export default function SessionList({ sessions, onNewSession, onDeleteSession }: SessionListProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onNewSession}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        + New Session
      </button>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Link href={`/session/${session.id}`} className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{session.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session.messages.length} messages • {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDeleteSession(session.id);
              }}
              className="ml-2 p-1 text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No sessions yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}