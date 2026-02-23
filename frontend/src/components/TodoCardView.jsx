import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Trash2, Edit2, Loader } from 'lucide-react';

const priorityColors = {
  'High': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' },
  'Medium': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' },
  'Low': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300' },
};

const statusColors = {
  'Pending': { bg: 'bg-neutral-700/50', text: 'text-neutral-300' },
  'In Progress': { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-300' },
  'Completed': { bg: 'bg-green-500/10 border border-green-500/20', text: 'text-green-300' },
};

export default function TodoCardView({
  todos,
  onEdit,
  onDelete,
  onStatusChange,
  deletingId,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Empty state is handled by parent component (TodoListWithCRUD)
  // When todos is empty array, render empty grid (parent will show EmptyState instead)
  
  if (todos.length === 0) {
    return null; // Parent will show EmptyState component
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 auto-rows-max">
      {todos.map((todo) => {
        const priority = todo.priority || 'Medium';
        const priorityColor = priorityColors[priority] || priorityColors['Medium'];
        const statusColor = statusColors[todo.status] || statusColors['Pending'];
        const isDeleting = deletingId === todo.id;

        return (
          <div
            key={todo.id}
            className={`border rounded-lg p-4 transition-all ${priorityColor.border} ${priorityColor.bg} ${
              isDeleting ? 'opacity-50 bg-red-500/5' : 'hover:shadow-lg hover:shadow-neutral-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold break-words line-clamp-2 ${
                    todo.status === 'Completed'
                      ? 'text-neutral-500 line-through'
                      : 'text-neutral-100'
                  }`}
                >
                  {todo.notes || 'Untitled'}
                </p>
              </div>
              <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${priorityColor.badge}`}>
                {priority[0].toUpperCase()}
              </span>
            </div>

            {/* Status and Date */}
            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Status</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                >
                  {todo.status || 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Due Date</p>
                <p className="text-sm text-neutral-200">{formatDate(todo.date)}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-700 mb-3"></div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => onStatusChange(todo, todo.status === 'Pending' ? 'In Progress' : todo.status === 'In Progress' ? 'Completed' : 'Pending')}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-700/50 text-neutral-200 hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {todo.status === 'Completed' ? '↻ Reopen' : '✓ Next'}
              </button>
              <button
                onClick={() => onEdit(todo)}
                disabled={isDeleting}
                className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-700/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                disabled={isDeleting}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-700/50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                {isDeleting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
