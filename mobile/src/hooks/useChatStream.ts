import { useState } from 'react';
import { API_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  const sendMessage = async (content: string, sessionId: string) => {
    if (!token || !content.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setStreaming(true);
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sessionId }),
    });
    const reader = response.body?.getReader();
    if (!reader) {
      setStreaming(false);
      return;
    }
    const decoder = new TextDecoder();
    let assistantContent = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6)) as { token?: string; done?: boolean };
          if (data.token) {
            assistantContent += data.token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
              return updated;
            });
          }
        }
      }
    }
    setStreaming(false);
  };

  return { messages, streaming, sendMessage };
}
