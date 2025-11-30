import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Star, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getAuthState } from '../utils/authUtils';
import { submitSuggestion } from '../services/supportAPI';
import { sendChatMessage, type ChatMessageResponse, type ChatTemplate, type ChatActionButton, type ChatRole } from '../services/chatAPI';

type Tab = 'feedback' | 'ai';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  templates?: ChatTemplate[];
  actionButtons?: ChatActionButton[] | null;
  createdAt: string;
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('feedback');

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed bottom-6 right-6 z-[9990]">
      {/* Panel */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
                <Star size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">PandaDocs Assistant</p>
                <p className="text-xs text-white/80">Feedback & AI helper</p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="p-1 rounded-full hover:bg-white/10"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 text-sm font-medium">
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 px-3 py-2 text-center ${
                activeTab === 'feedback'
                  ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Feedback
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 px-3 py-2 text-center ${
                activeTab === 'ai'
                  ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              AI Helper
            </button>
          </div>

          <div className="p-4 max-h-[420px] overflow-hidden">
            {activeTab === 'feedback' ? <FeedbackTab /> : <AiChatTab />}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className="group flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
          <MessageCircle className="group-hover:scale-110 transition-transform" size={20} />
        </span>
        <span className="text-sm font-semibold hidden sm:inline">Assistant</span>
      </button>
    </div>
  );
}

function FeedbackTab() {
  const toast = useToast();
  const { isAuthenticated } = getAuthState();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Sign in required', 'Please sign in to send feedback.');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Message required', 'Please enter your feedback before sending.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitSuggestion(trimmed);
      toast.success('Feedback sent', 'Thanks for helping us improve PandaDocs!');
      setMessage('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Submission failed', 'Unable to send your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <p className="text-gray-600 text-xs">
        Share ideas, issues, or improvements. Your feedback goes directly to the PandaDocs team.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Write your feedback here..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send feedback'}
        </button>
      </div>
    </form>
  );
}

// Helper function to clean markdown formatting from message
const cleanMessage = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
    .replace(/`(.*?)`/g, '$1') // Remove `code`
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links, keep text
    .trim();
};

function AiChatTab() {
  const toast = useToast();
  const { isAuthenticated } = getAuthState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (!isAuthenticated) {
      toast.error('Sign in required', 'Please sign in to use AI helper.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response: ChatMessageResponse = await sendChatMessage({
        message: trimmed,
        sessionId,
      });

      setSessionId(response.sessionId);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ASSISTANT',
        content: cleanMessage(response.message),
        templates: response.templates,
        actionButtons: response.actionButtons,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to get AI response. Please try again.';
      toast.error('AI Error', message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const renderTemplates = (templates?: ChatTemplate[]) => {
    if (!templates || templates.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {templates.slice(0, 2).map((tpl) => (
          <div
            key={tpl.id}
            className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-xs space-y-1.5"
          >
            <div className="font-semibold text-gray-900 line-clamp-1">{tpl.title}</div>
            {tpl.description && (
              <div className="text-gray-600 line-clamp-2 text-xs leading-relaxed">
                {tpl.description}
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              {typeof tpl.price === 'number' && (
                <div className="text-xs font-semibold text-emerald-700">
                  {tpl.price === 0 ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Free</span>
                  ) : (
                    <span>{tpl.price.toLocaleString('vi-VN')} VNĐ</span>
                  )}
                </div>
              )}
              {tpl.category && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {tpl.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[360px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <div className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3">
            Ask the AI to help you find templates. For example:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>“I need a CV template for backend developer.”</li>
              <li>“Suggest a presentation template for marketing pitch.”</li>
            </ul>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'USER'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
              {renderTemplates(msg.templates)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 border-t pt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Ask the AI about templates... (Enter to send, Shift+Enter for new line)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !input.trim()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

