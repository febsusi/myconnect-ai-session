'use client';

import { useState, useEffect, useRef } from 'react';
import { Session, Message } from '@/types';
import { getSessions, createSession, deleteSession, addMessageToSession } from '@/lib/store';

// Particles Background Component
const ParticlesBackground = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
      document.querySelector('.particle-container')?.appendChild(particle);
      
      setTimeout(() => particle.remove(), 20000);
    };
    
    const interval = setInterval(createParticle, 500);
    return () => clearInterval(interval);
  }, []);
  
  return <div className="particle-container fixed inset-0 pointer-events-none overflow-hidden" />;
};

// Toast Component with Animation
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl animate-slide-in flex items-center gap-2 ${
      type === 'error' 
        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
    }`}>
      <span>{type === 'error' ? '⚠️' : '✅'}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center animate-float">
    <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-glow">
      <span className="text-5xl">💬</span>
    </div>
    <h3 className="text-2xl font-bold gradient-text mb-2">Welcome to AI Session Manager</h3>
    <p className="text-gray-400 max-w-md">
      Start a new conversation with AI powered by Groq's Llama 3.3 70B model
    </p>
    <div className="mt-6 flex gap-2 text-sm text-gray-400">
      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">✨ Streaming responses</span>
      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">🎨 Dark mode</span>
      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">⚡ Real-time AI</span>
    </div>
  </div>
);

// Chat Bubble Component
const ChatBubble = ({ message, isUser }: { message: Message; isUser: boolean }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-message-pop`}>
    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
      isUser 
        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
        : 'bg-gradient-to-br from-purple-500 to-pink-500'
    } shadow-lg`}>
      <span className="text-white text-sm">
        {isUser ? '👤' : '🤖'}
      </span>
      {!isUser && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
      )}
    </div>
    <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`relative p-3 rounded-2xl ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-sm shadow-lg' 
          : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white rounded-bl-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50'
      }`}>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
      <span className="text-xs text-gray-400 mt-1 block px-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </div>
);

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark';
    setIsDark(dark);
    if (dark) document.documentElement.classList.add('dark');
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages, streamingText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const loadSessions = async () => {
    setLoading(true);
    const allSessions = getSessions();
    setSessions(allSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    setLoading(false);
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNewSession = () => {
    const newSession = createSession();
    loadSessions();
    setSelectedSession(newSession);
    setToast({ message: '✨ New session created!', type: 'success' });
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    if (selectedSession?.id === id) setSelectedSession(null);
    loadSessions();
    setToast({ message: '🗑️ Session deleted', type: 'success' });
  };

  const sendMessageToGroq = async (userMessage: string, history: Array<{ role: string; content: string }>) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                fullResponse += parsed.token;
                setStreamingText(fullResponse);
              }
            } catch (e) {}
          }
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession || isLoading) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    const updatedSession = addMessageToSession(selectedSession.id, userMessage, 'user');
    if (updatedSession) setSelectedSession(updatedSession);
    
    setIsLoading(true);
    setStreamingText('');
    
    const history = selectedSession.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: userMessage });
    
    try {
      const assistantResponse = await sendMessageToGroq(userMessage, history);
      
      if (assistantResponse) {
        const finalSession = addMessageToSession(selectedSession.id, assistantResponse, 'assistant');
        if (finalSession) setSelectedSession(finalSession);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      setToast({ message: errorMessage, type: 'error' });
      
      const errorResponse = `⚠️ Oops! ${errorMessage}. Please try again.`;
      const finalSession = addMessageToSession(selectedSession.id, errorResponse, 'assistant');
      if (finalSession) setSelectedSession(finalSession);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <ParticlesBackground />
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient pointer-events-none" />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-5 right-5 z-50 p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110"
      >
        <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
      </button>

      {/* Sidebar */}
      <div className={`relative z-10 ${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-500 shadow-2xl`}>
        <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <h2 className="font-bold text-lg gradient-text">AI Sessions</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-110"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <div className="p-4">
          <button
            onClick={handleNewSession}
            className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            {!sidebarCollapsed && <span>New Conversation</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <SkeletonLoader />
          ) : (
            sessions.map((session, idx) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 hover-lift ${
                  selectedSession?.id === session.id
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 shadow-md'
                    : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">
                        {session.messages.length} messages
                      </p>
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      <p className="text-xs text-gray-400">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-xs text-center text-gray-400">
              <p>Powered by</p>
              <p className="font-semibold gradient-text mt-1">Groq Llama 3.3 70B</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-0">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white">💬</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedSession.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedSession.messages.length} messages • Active now
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selectedSession.messages.map((message: Message) => (
                <ChatBubble 
                  key={message.id} 
                  message={message} 
                  isUser={message.role === 'user'} 
                />
              ))}
              
              {/* Streaming message */}
              {isLoading && (
                <div className="flex gap-3 animate-message-pop">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg relative">
                    <span className="text-white text-sm">🤖</span>
                    <div className="absolute inset-0 rounded-full animate-pulseRing bg-purple-500/50" />
                  </div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-2xl rounded-bl-sm max-w-[70%] shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                    {streamingText ? (
                      <>
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-white leading-relaxed">
                          {streamingText}
                          <span className="inline-block w-0.5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 ml-1 animate-pulse rounded-full" />
                        </p>
                        <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient rounded-full" />
                      </>
                    ) : (
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-typing-bounce" />
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-typing-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-typing-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 p-5">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    disabled={isLoading}
                    rows={1}
                    className="w-full px-5 py-3.5 border-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-lg transition-all duration-300"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {inputMessage.length > 0 && `✨ ${inputMessage.length}`}
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-7 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 group"
                >
                  <span>Send</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400">
                  Powered by <span className="font-semibold">Groq Llama 3.3 70B</span> • Free & Fast
                </p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}