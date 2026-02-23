import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TodoListWithCRUD from './components/TodoListWithCRUD';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import ProfileModal from './components/ProfileModal';
import ErrorBoundary from './components/ErrorBoundary';
import { AlertCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function DashboardContent({ user, token, logout, userId }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create axios instance with authentication token
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId.toString(),
      'Authorization': token,
    },
  });

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await axiosInstance.get(`/auth/todo/${userId}`);
      setTodos(response.data);
      setIsOnline(true);
    } catch (err) {
      if (axios.isCancel(err)) {
        return; // Request was cancelled, don't update state
      }
      
      console.error('Error fetching todos:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        logout();
        return;
      }
      
      setError('Failed to load todos. Check if backend is running.');
      
      if (err.response?.status === 0 || err.code === 'ECONNABORTED') {
        setIsOnline(false);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch only on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Handle chat response with support for all CRUD operations
  const handleChatResponse = (response, operationType) => {
    console.log('Chat response:', response);
    console.log('Operation type:', operationType);
    
    if (!response?.answer) {
      console.log('No answer in response');
      return;
    }

    // If response is array of todos, update the list
    if (Array.isArray(response.answer)) {
      try {
        // Validate that it looks like todo data
        if (response.answer.length > 0 && response.answer[0].id && response.answer[0].notes) {
          setTodos(response.answer);
          console.log(`✓ Updated todos list with ${response.answer.length} items`);
        } else if (response.answer.length === 0) {
          setTodos([]);
          console.log('✓ No todos found');
        }
      } catch (err) {
        console.error('Error parsing todos:', err);
      }
    }
    
    // For write operations (CREATE/UPDATE/DELETE), log what happened
    if (operationType) {
      if (operationType.isCreate) console.log('✓ CREATE: Task created successfully');
      if (operationType.isUpdate) console.log('✓ UPDATE: Task updated successfully');
      if (operationType.isDelete) console.log('✓ DELETE: Task deleted successfully');
    }
  };

  return (
    <div className="h-screen bg-neutral-950 text-neutral-50 flex flex-col overflow-hidden">
      {/* Header Component - Fixed Height, Never Scrolls */}
      <Header 
        isOnline={isOnline}
        isRefreshing={isRefreshing}
        onRefresh={fetchTodos}
        onLogout={logout}
      />

      {/* Error Banner - Fixed, doesn't take up scroll space */}
      {error && (
        <div className="px-6 py-3 bg-red-950/50 border-b border-red-900/50 flex items-start gap-3 flex-shrink-0">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">{error}</p>
            <p className="text-xs text-red-400 mt-1">Make sure the FastAPI backend is running on port 8000</p>
          </div>
        </div>
      )}

      {/* Main Content - Fills remaining viewport height, flex container */}
      <div className="flex flex-1 gap-px bg-neutral-800 overflow-hidden">
        {/* Left Panel - Todo List with Independent Scroll */}
        <div className="w-1/2 flex flex-col bg-neutral-900 overflow-hidden border-r border-neutral-800">
          {loading && !todos.length ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
                  <div className="w-10 h-10 border-2 border-neutral-700 border-t-blue-500 rounded-full"></div>
                </div>
                <p className="text-neutral-400 text-sm">Loading todos...</p>
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 text-sm">No todos yet. Ask the AI to create one!</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <TodoListWithCRUD 
                todos={todos}
                apiBaseUrl={API_BASE_URL}
                userId={userId}
                token={token}
                onTodosUpdated={fetchTodos}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Chat Interface with Independent Scroll */}
        <div className="w-1/2 flex flex-col bg-neutral-900 overflow-hidden">
          {/* Panel Header - Fixed */}
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-800/50 flex-shrink-0">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <p className="text-xs text-neutral-400 mt-1">Chat to manage your todos</p>
          </div>
          
          {/* Panel Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ErrorBoundary>
              <ChatInterface 
                onResponseReceived={handleChatResponse}
                apiBaseUrl={API_BASE_URL}
                userId={userId}
                token={token}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isInitialized, loading, user, token, logout, showProfileModal, setShowProfileModal } = useAuth();
  const [authMode, setAuthMode] = useState('login');

  // Show loading screen while initializing auth
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
            <div className="w-10 h-10 border-2 border-neutral-700 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-neutral-400">Initializing...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </>
    );
  }

  return (
    <>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <DashboardContent
        user={user}
        token={token}
        logout={logout}
        userId={user?.id}
      />
    </>
  );
}