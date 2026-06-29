import React, { useState, useRef, useEffect } from 'react';
import { chatService, type ChatMessage } from '../../services/chat.service';
import ChatMessageContent from './ChatMessageContent';
import {
  CHAT_WELCOME_MESSAGE,
  loadChatHistory,
  saveChatHistory,
} from '../../utils/chatHistoryStorage';

const SUGGESTIONS = [
  'Best card for gas?',
  'Best for groceries?',
  'Maximize dining rewards?',
];

interface ChatPanelProps {
  /** Tighter layout for the floating popup */
  compact?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ compact = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const syncHistory = async () => {
      const response = await chatService.fetchHistory();
      if (cancelled) return;

      if (response.success && response.data) {
        const remote = response.data.messages.filter(
          (m) =>
            (m.role === 'user' || m.role === 'assistant') &&
            m.content.trim().length > 0,
        );
        setMessages(remote.length > 0 ? remote : [CHAT_WELCOME_MESSAGE]);
      }
      setHistoryReady(true);
    };

    syncHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    saveChatHistory(messages);
  }, [messages, historyReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    const response = await chatService.sendMessage(trimmed);

    if (response.success && response.data) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data!.reply },
      ]);
    } else {
      setError(response.error?.message || 'Could not get a reply. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className={`chat-panel ${compact ? 'chat-panel--compact' : ''}`}>
      <div className="chat-panel-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble-row ${msg.role === 'user' ? 'chat-bubble-row--user' : ''}`}
          >
            <div
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--bot'}`}
            >
              {msg.role === 'assistant' ? (
                <ChatMessageContent text={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble-row">
            <div className="chat-bubble chat-bubble--bot chat-bubble--typing">Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="chat-panel-error" role="alert">
          {error}
        </p>
      )}

      <div className="chat-panel-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="chat-suggestion-chip"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-panel-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your cards…"
          className="chat-panel-input"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="chat-panel-send page-btn page-btn-primary"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
