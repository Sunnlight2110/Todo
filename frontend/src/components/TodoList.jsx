import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Trash2 } from 'lucide-react';

const priorityColors = {
  'High': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300' },
  'Medium': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300' },
  'Low': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300' },
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

export default function TodoList({ todos }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Sort todos by status and priority
  const sortedTodos = [...todos].sort((a, b) => {
    const statusOrder = { 'Pending': 0, 'In Progress': 1, 'Completed': 2 };
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    
    const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    if (statusDiff !== 0) return statusDiff;
    
    return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-neutral-800">
        {sortedTodos.map((todo) => {
          const StatusIcon = statusIcons[todo.status] || Circle;
          const priority = todo.priority || 'Medium';
          const priorityColor = priorityColors[priority] || priorityColors['Medium'];
          const statusColor = statusColors[todo.status] || 'text-neutral-400';

          return (
            <div
              key={todo.id}
              className={`p-4 transition-colors hover:bg-neutral-800/50 cursor-pointer border-l-4 ${
                priority === 'High' ? 'border-l-red-500' :
                priority === 'Medium' ? 'border-l-amber-500' :
                'border-l-blue-500'
              }`}
            >
              {/* Header with Status and Priority */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <StatusIcon size={20} className={`flex-shrink-0 mt-0.5 ${statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-100 break-words line-clamp-2">
                      {todo.notes || 'Untitled'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded whitespace-nowrap ${priorityColor.badge}`}>
                  {priority}
                </span>
              </div>

              {/* Meta Information */}
              <div className="flex items-center gap-4 ml-8 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                  {formatDate(todo.date)}
                </div>
              </div>

              {/* Status Badge */}
              <div className="ml-8 mt-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  todo.status === 'Pending' ? 'bg-neutral-700/50 text-neutral-300' :
                  todo.status === 'In Progress' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                  'bg-green-500/10 text-green-300 border border-green-500/20'
                }`}>
                  {todo.status || 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {todos.length === 0 && (
        <div className="flex items-center justify-center h-full text-neutral-400">
          <div className="text-center">
            <p className="text-sm">No todos found</p>
          </div>
        </div>
      )}
    </div>
  );
}
