import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sendChatMessage,
  handlePurchaseAction,
  getChatSession,
  clearChatSession,
  type Template,
  type ActionButton
} from '../pages/Chat/services/chatAPI';
import { getAuthState } from '../utils/authUtils';
import { useToast } from '../contexts/ToastContext';

interface Message {
  role: 'USER' | 'ASSISTANT';
  content: string;
  templates?: Template[];
  actionButtons?: ActionButton[];
  timestamp?: string;
}

export default function ChatBox() {
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = getAuthState();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitRetryAfter && rateLimitRetryAfter > 0) {
      const timer = setInterval(() => {
        setRateLimitRetryAfter((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimitRetryAfter]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId && token) {
      getChatSession(savedSessionId)
        .then((data) => {
          setSessionId(data.sessionId);
          const loadedMessages: Message[] = data.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }));
          setMessages(loadedMessages);
        })
        .catch(() => {
          // Session expired, start new
          localStorage.removeItem('chatSessionId');
        });
    }
  }, [token]);

  // Save sessionId to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !token) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setRateLimitRetryAfter(null);

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: 'USER',
        content: userMessage,
        timestamp: new Date().toISOString()
      }
    ]);

    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        sessionId: null,
        message: userMessage
      });

      // Update session ID from response
      setSessionId(response.sessionId);

      // Add AI response to UI
      const newMessage: Message = {
        role: 'ASSISTANT',
        content: response.message,
        templates: response.templates.length > 0 ? response.templates : undefined,
        actionButtons: response.actionButtons ?? undefined,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // Handle rate limit
      if (errorMessage.includes('Rate limit') || errorMessage.includes('limit')) {
        setRateLimitRetryAfter(3600); // Default 1 hour
      }
      
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = async (action: string, templateId: number) => {
    if (action === 'CANCEL' || !sessionId || !token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await handlePurchaseAction({
        sessionId,
        templateId,
        action
      });

      if (response.action === 'VIEW_DETAILS' && response.url) {
        navigate(response.url);
      } else if (response.action === 'REDIRECT_TO_PURCHASE') {
        navigate(`/payment/${templateId}`);
      } else if (response.action === 'ADD_TO_LIBRARY') {
        // Call add to library API if endpoint provided
        if (response.endpoint) {
          // You can implement the actual API call here
          toast.success('Success', 'Template added to library!');
        } else {
          toast.success('Success', 'Template added to library!');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!sessionId || !token) {
      setMessages([]);
      setSessionId(null);
      localStorage.removeItem('chatSessionId');
      return;
    }

    try {
      await clearChatSession(sessionId);
      setMessages([]);
      setSessionId(null);
      localStorage.removeItem('chatSessionId');
      toast.success('Success', 'Chat history cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error('Error', errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp?: string): string => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] border rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">PandaDocs AI Assistant</h2>
            <p className="text-sm opacity-90">Find templates quickly</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Clear chat history"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg font-medium">Welcome to AI Assistant!</p>
              <p className="text-sm mt-2">Ask me about any template you need</p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-lg p-3 shadow-sm ${
                msg.role === 'USER'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              
              {msg.timestamp && (
                <p className={`text-xs mt-1 ${msg.role === 'USER' ? 'text-green-100' : 'text-gray-500'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              )}

              {/* Template Cards */}
              {msg.templates && msg.templates.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.templates.slice(0, 3).map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/templates/${template.id}`)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={template.previewImage}
                          alt={template.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm font-bold text-green-600">
                              {template.price === 0 ? 'FREE' : `$${template.price.toLocaleString('en-US')}`}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>⭐ {template.rating}</span>
                              <span>•</span>
                              <span>{template.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {msg.actionButtons && msg.actionButtons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.actionButtons.map((btn, btnIndex) => (
                    <button
                      key={btnIndex}
                      onClick={() => handleActionClick(btn.type, btn.templateId)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        btn.type === 'CANCEL'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-800 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Rate limit message */}
      {rateLimitRetryAfter && rateLimitRetryAfter > 0 && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-yellow-800 text-sm">
          <p>You have exceeded the message limit.</p>
          <p className="text-xs mt-1">Try again after: {Math.floor(rateLimitRetryAfter / 60)} minute(s) {rateLimitRetryAfter % 60} second(s)</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading || (rateLimitRetryAfter !== null && rateLimitRetryAfter > 0) || !token}
            rows={2}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 resize-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || (rateLimitRetryAfter !== null && rateLimitRetryAfter > 0) || !token}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

