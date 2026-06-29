import React, { useState, useRef, useEffect } from 'react';
import PageLayout from '../Layout/PageLayout';
import { chatService, type ChatMessage } from '../../services/chat.service';

const SUGGESTIONS = [
  'Which card is best for gas?',
  'What card should I use for groceries?',
  'How can I maximize dining rewards?',
];

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! Ask me about your wallet — for example which card to use for gas, groceries, or travel. I use your saved cards and reward rules to answer.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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

    const history = nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant');
    const response = await chatService.sendMessage(trimmed, history.slice(0, -1));

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
    <PageLayout
      title="CardSense Assistant"
      subtitle="Ask which card to use based on your wallet and reward categories"
      maxWidth="3xl"
    >
      <div className="page-card flex flex-col" style={{ minHeight: '28rem' }}>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: '22rem' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
                style={msg.role === 'user' ? { backgroundColor: '#5E17EB' } : undefined}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 rounded-2xl px-4 py-3 text-sm">
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. What card should I use for gas?"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="page-btn page-btn-primary px-5 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ChatAssistant;
