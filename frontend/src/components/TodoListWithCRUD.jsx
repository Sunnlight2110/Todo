import React, { useState, useMemo } from 'react';
import { Plus, Grid3x3, List, Calendar } from 'lucide-react';
import TodoForm from './TodoForm';
import TodoFilterBar from './TodoFilterBar';
import TodoListView from './TodoListView';
import TodoCardView from './TodoCardView';
import TodoCalendarView from './TodoCalendarView';
import EmptyState from './EmptyState';
import axios from 'axios';

export default function TodoListWithCRUD({ todos, apiBaseUrl, userId, token, onTodosUpdated }) {
  // Form and CRUD state
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    dueDate: 'all',
  });

  // View mode state
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'card' | 'calendar'

  // Filter logic with memoization
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    // Filter by status
    if (filters.status !== 'All') {
      result = result.filter((todo) => todo.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'All') {
      result = result.filter((todo) => todo.priority === filters.priority);
    }

    // Filter by due date
    if (filters.dueDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      result = result.filter((todo) => {
        if (!todo.date) return filters.dueDate === 'all';

        const todoDate = new Date(todo.date);
        todoDate.setHours(0, 0, 0, 0);

        if (filters.dueDate === 'today') {
          return todoDate.getTime() === today.getTime();
        } else if (filters.dueDate === 'upcoming') {
          return todoDate.getTime() > today.getTime();
        } else if (filters.dueDate === 'overdue') {
          return todoDate.getTime() < today.getTime();
        }

        return true;
      });
    }

    return result;
  }, [todos, filters]);

  // CRUD handlers
  const handleCreateTodo = (formData) => {
    setEditingTodo(null);
    handleSubmitTodo(formData);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleUpdateTodo = (formData) => {
    if (!editingTodo) return;
    handleSubmitTodo(formData, editingTodo.id);
  };

  const handleSubmitTodo = async (formData, todoId = null) => {
    console.log('handleSubmitTodo called with:', { formData, todoId, isEdit: !!todoId });

    if (!userId || !token || !apiBaseUrl) {
      setError('Missing authentication credentials');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = todoId
        ? `${apiBaseUrl}/auth/todo/${todoId}`
        : `${apiBaseUrl}/auth/todo`;

      const method = todoId ? 'PATCH' : 'POST';

      const data = {
        ...formData,
        date: formData.date instanceof Date
          ? formData.date.toISOString()
          : new Date(formData.date).toISOString(),
      };

      console.log('Sending request:', { method, url, data });

      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
      });

      console.log('Response received:', response.data);

      setShowForm(false);
      setEditingTodo(null);

      if (onTodosUpdated) {
        onTodosUpdated();
      }
    } catch (err) {
      console.error('Error saving todo:', err);
      let errorMessage = 'Failed to save todo';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    console.log('Delete button clicked, todoId:', todoId, 'type:', typeof todoId);

    if (!todoId) {
      setError('Error: Todo ID is missing');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    if (!userId || !token || !apiBaseUrl) {
      setError('Missing authentication credentials');
      return;
    }

    setDeletingId(todoId);
    setError(null);

    try {
      const deleteUrl = `${apiBaseUrl}/auth/todo/${todoId}`;
      console.log('DELETE request URL:', deleteUrl);

      await axios.delete(deleteUrl, {
        headers: {
          'Authorization': token || '',
        },
      });

      if (onTodosUpdated) {
        onTodosUpdated();
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      let errorMessage = 'Failed to delete todo';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (todo, newStatus) => {
    if (!userId || !token || !apiBaseUrl) {
      setError('Missing authentication credentials');
      return;
    }

    try {
      await axios.patch(
        `${apiBaseUrl}/auth/todo/${todo.id}`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token || '',
          },
        }
      );

      if (onTodosUpdated) {
        onTodosUpdated();
      }
    } catch (err) {
      console.error('Error updating todo status:', err);
      let errorMessage = 'Failed to update todo';

      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  // Render the appropriate view
  const renderView = () => {
    const viewProps = {
      todos: filteredTodos,
      onEdit: handleEditTodo,
      onDelete: handleDeleteTodo,
      onStatusChange: handleStatusChange,
      deletingId,
    };

    switch (viewMode) {
      case 'card':
        return <TodoCardView {...viewProps} />;
      case 'calendar':
        return <TodoCalendarView {...viewProps} />;
      case 'list':
      default:
        return <TodoListView {...viewProps} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Create Button and View Toggle */}
      <div className="flex-shrink-0 border-b border-neutral-800 p-4 bg-neutral-800/30 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setEditingTodo(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 active:scale-95"
          >
            <Plus size={16} />
            Add New Todo
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-neutral-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Card View"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Calendar View"
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>

        {/* Todo count */}
        <div className="text-xs text-neutral-400">
          {filteredTodos.length} of {todos.length} todo{todos.length !== 1 ? 's' : ''}
          {filteredTodos.length !== todos.length && ' (filtered)'}
        </div>
      </div>

      {/* Scrollable Content Section - Filters and Views */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Filter Bar */}
        <TodoFilterBar filters={filters} onFiltersChange={setFilters} />

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* View Content */}
        {filteredTodos.length === 0 && todos.length === 0 ? (
          <EmptyState
            onCreateTodo={() => {
              setEditingTodo(null);
              setShowForm(true);
            }}
          />
        ) : (
          renderView()
        )}
      </div>

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
          initialData={editingTodo}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
