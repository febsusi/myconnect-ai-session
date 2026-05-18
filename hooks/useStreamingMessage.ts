'use client';

import { useState, useCallback } from 'react';
import { simulateApiBehavior } from '@/lib/utils/simulateApiBehavior';

interface UseStreamingMessageReturn {
  sendMessage: (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    onToken: (token: string) => void
  ) => Promise<void>;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

export default function useStreamingMessage(): UseStreamingMessageReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Array<{ role: 'user' | 'assistant'; content: string }>,
      onToken: (token: string) => void
    ) => {
      setIsStreaming(true);
      setStreamingContent('');
      setError(null);

      try {
        await simulateApiBehavior(async () => {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error('No reader available');

          let fullText = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.token) {
                    fullText += parsed.token;
                    setStreamingContent(fullText);
                    onToken(parsed.token);
                  }
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch (e) {
                  console.error('Parse error', e);
                }
              }
            }
          }
        }, 500, 0.1);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Streaming error';
        setError(errMsg);
        console.error('Streaming error:', error);
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    []
  );

  return { sendMessage, isStreaming, streamingContent, error };
}