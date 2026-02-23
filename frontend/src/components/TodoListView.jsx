import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Trash2, Edit2, Loader } from 'lucide-react';

const priorityColors = {
  'High': { badge: 'bg-red-500/20 text-red-300' },
  'Medium': { badge: 'bg-amber-500/20 text-amber-300' },
  'Low': { badge: 'bg-blue-500/20 text-blue-300' },
};

const statusIcons = {
  'Pending': Circle,
  'In Progress': AlertCircle,
  'Completed': CheckCircle2,
};

const statusColors = {
  'Pending': 'text-neutral-400',
  'In Progress': 'text-amber-400',
  'Completed': 'text-green-400',
};

export default function TodoListView({
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
  // When todos is empty array, render empty list (parent will show EmptyState instead)

  return (
    <div className="divide-y divide-neutral-800">
      {todos.map((todo) => {
        const StatusIcon = statusIcons[todo.status] || Circle;
        const priority = todo.priority || 'Medium';
        const priorityColor = priorityColors[priority] || priorityColors['Medium'];
        const statusColor = statusColors[todo.status] || 'text-neutral-400';
        const isDeleting = deletingId === todo.id;

        return (
          <div
            key={todo.id}
            className={`p-4 transition-colors border-l-4 group ${
              priority === 'High'
                ? 'border-l-red-500'
                : priority === 'Medium'
                ? 'border-l-amber-500'
                : 'border-l-blue-500'
            } ${isDeleting ? 'bg-red-500/5 opacity-50' : 'hover:bg-neutral-800/50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: Status + Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    const nextStatuses = {
                      'Pending': 'In Progress',
                      'In Progress': 'Completed',
                      'Completed': 'Pending',
                    };
                    onStatusChange(todo, nextStatuses[todo.status] || 'Pending');
                  }}
                  disabled={isDeleting}
                  className={`flex-shrink-0 mt-0.5 transition-colors hover:opacity-80 disabled:opacity-50 ${statusColor}`}
                  title="Click to change status"
                >
                  <StatusIcon size={20} />
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium break-words line-clamp-2 transition-colors ${
                      todo.status === 'Completed'
                        ? 'text-neutral-500 line-through'
                        : 'text-neutral-100'
                    }`}
                  >
                    {todo.notes || 'Untitled'}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                      {formatDate(todo.date)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        todo.status === 'Pending'
                          ? 'bg-neutral-700/50 text-neutral-300'
                          : todo.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-green-500/10 text-green-300 border border-green-500/20'
                      }`}
                    >
                      {todo.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Priority + Actions */}
              <div className="flex items-start gap-2">
                <span
                  className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap ${priorityColor.badge}`}
                >
                  {priority}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(todo)}
                    disabled={isDeleting}
                    className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit todo"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(todo.id)}
                    disabled={isDeleting}
                    className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete todo"
                  >
                    {isDeleting ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
