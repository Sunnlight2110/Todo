import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, AlertCircle, Loader } from 'lucide-react';
import { getOrCreateSessionUUID, updateSessionUUID } from '../utils/sessionUUID';

export default function ChatInterface({ onResponseReceived, apiBaseUrl, userId, token }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionUUID, setSessionUUID] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize session UUID on component mount
  useEffect(() => {
    const uuid = getOrCreateSessionUUID();
    setSessionUUID(uuid);
    console.log('Chat session initialized with UUID:', uuid);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Guard against undefined values
    if (!inputValue || !inputValue.trim()) {
      return;
    }

    // Guard against missing required props
    if (!userId || !token || !apiBaseUrl) {
      console.error('Missing required props:', { userId, token, apiBaseUrl });
      setError('Configuration error: Missing auth credentials');
      return;
    }

    // Guard against missing session UUID
    if (!sessionUUID) {
      console.error('Session UUID not initialized');
      setError('Chat session not initialized');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      // Ensure userId is a valid number
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) {
        throw new Error('Invalid user ID');
      }

      // Send message to backend with session_uuid
      const response = await axios.post(
        `${apiBaseUrl}/ai/chat`,
        { 
          message: userMessage,
          session_uuid: sessionUUID 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': userIdNum.toString(),
            'Authorization': token || '',
          },
          timeout: 30000,
        }
      );

      console.log('Full response:', response.data);
      
      // Update session UUID from backend response if provided
      if (response.data?.session_uuid) {
        const newUUID = response.data.session_uuid;
        updateSessionUUID(newUUID);
        setSessionUUID(newUUID);
        console.log('Session UUID updated:', newUUID);
      }
      
      const aiResponse = response.data?.answer;
      
      if (!aiResponse) {
        throw new Error('No answer in response');
      }

      // Check if response is an array of todos (READ operation)
      const isArrayResponse = Array.isArray(aiResponse);
      let responseContent = aiResponse;
      let operationType = { isRead: false, isCreate: false, isUpdate: false, isDelete: false };

      if (isArrayResponse) {
        // READ operation - response is array of todos
        operationType.isRead = true;
        responseContent = aiResponse;
        console.log(`READ: Found ${aiResponse.length} tasks`);
      } else if (typeof aiResponse === 'string') {
        // WRITE operation - response is text confirmation
        const lowerResponse = aiResponse.toLowerCase();
        
        if (lowerResponse.includes('created') || lowerResponse.includes('added')) {
          operationType.isCreate = true;
          console.log('CREATE operation detected');
        } else if (lowerResponse.includes('updated') || lowerResponse.includes('marked') || lowerResponse.includes('completed')) {
          operationType.isUpdate = true;
          console.log('UPDATE operation detected');
        } else if (lowerResponse.includes('deleted') || lowerResponse.includes('removed')) {
          operationType.isDelete = true;
          console.log('DELETE operation detected');
        }
        
        responseContent = aiResponse;
      }

      // Add AI response to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      }]);

      // Show success message for WRITE operations only
      if (operationType.isCreate || operationType.isUpdate || operationType.isDelete) {
        let successMsg = '✅ Operation successful';
        if (operationType.isCreate) successMsg = '✅ Task created successfully';
        else if (operationType.isUpdate) successMsg = '✅ Task updated successfully';
        else if (operationType.isDelete) successMsg = '✅ Task deleted successfully';

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'system',
          content: successMsg,
          timestamp: new Date()
        }]);
      }

      // Notify parent component with the full response
      if (onResponseReceived && typeof onResponseReceived === 'function') {
        onResponseReceived(response.data, operationType);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      
      let errorMessage = 'Failed to send message';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in.';
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid request. Please try again.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Try again.';
      } else if (err.message === 'Network Error' || !navigator.onLine) {
        errorMessage = 'Network error. Backend not running on port 8000.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'error',
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMessageContent = (content) => {
    // If content is an object/array, stringify it
    if (typeof content !== 'string') {
      return JSON.stringify(content, null, 2);
    }
    return content;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-neutral-300 font-medium mb-2">Start a conversation</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Ask the AI to create, edit, or manage your todos. Try: "Create a task to review reports by tomorrow"
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : message.role === 'error'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30 rounded-bl-none'
                      : message.role === 'system'
                      ? 'bg-green-500/10 text-green-300 border border-green-500/20 rounded-bl-none'
                      : 'bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700'
                  }`}
                >
                  {message.role === 'assistant' && Array.isArray(message.content) ? (
                    <div className="text-sm">
                      <p className="font-semibold mb-2 text-blue-300">📋 Todos Updated:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {message.content.map((todo, idx) => (
                          <div key={idx} className="bg-neutral-900/50 p-2 rounded border border-neutral-700">
                            <p className="font-medium text-sm">{todo.notes}</p>
                            <div className="flex gap-2 mt-1 text-xs text-neutral-400">
                              <span>📅 {todo.date}</span>
                              <span>•</span>
                              <span className={todo.priority === 'High' ? 'text-red-300' : todo.priority === 'Medium' ? 'text-yellow-300' : 'text-blue-300'}>
                                {todo.priority}
                              </span>
                              <span>•</span>
                              <span>{todo.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </p>
                  )}
                  <p className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-blue-200'
                      : message.role === 'error'
                      ? 'text-red-400'
                      : message.role === 'system'
                      ? 'text-green-400'
                      : 'text-neutral-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-neutral-100 rounded-lg rounded-bl-none border border-neutral-700 px-4 py-3 flex items-center gap-2">
                  <Loader size={16} className="animate-spin text-blue-400" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-neutral-800 p-4 bg-neutral-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value || '')}
            disabled={isLoading}
            placeholder="Ask me to create or manage your todos..."
            className="flex-1 bg-neutral-700 text-neutral-100 px-4 py-2.5 rounded-lg border border-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
              </>
            ) : (
              <>
                <Send size={16} />
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-neutral-500 mt-2">
          💡 Try: "Create a task", "Show my high-priority items", "Mark task 1 as done"
        </p>
      </div>
    </div>
  );
}
