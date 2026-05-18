'use client';

import { Session, Message } from '@/types';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import useStreamingMessage from '@/hooks/useStreamingMessage';
import { useEffect, useRef } from 'react';

interface SessionDetailProps {
  session: Session;
  onAddMessage: (content: string, role: 'user' | 'assistant') => void;
}

export default function SessionDetail({ session, onAddMessage }: SessionDetailProps) {
  const { sendMessage, isStreaming, streamingContent, error } = useStreamingMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, streamingContent]);

  const handleSend = async (userMessage: string) => {
    onAddMessage(userMessage, 'user');

    const conversationHistory = [
      ...session.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    let assistantResponse = '';
    await sendMessage(conversationHistory, (token) => {
      assistantResponse += token;
    });

    if (assistantResponse) {
      onAddMessage(assistantResponse, 'assistant');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {session.messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            {streamingContent ? (
              <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                <p className="whitespace-pre-wrap break-words">
                  {streamingContent}
                  <span className="animate-pulse">▊</span>
                </p>
              </div>
            ) : (
              <TypingIndicator />
            )}
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm">
              Error: {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <MessageInput onSend={handleSend} isLoading={isStreaming} />
      </div>
    </div>
  );
}
