import React from 'react';
import { X, Filter } from 'lucide-react';

export default function TodoFilterBar({ filters, onFiltersChange }) {
  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];
  const priorityOptions = ['All', 'Low', 'Medium', 'High'];
  const dueDateOptions = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Overdue', value: 'overdue' },
  ];

  const handleStatusChange = (status) => {
    onFiltersChange({
      ...filters,
      status: filters.status === status ? 'All' : status,
    });
  };

  const handlePriorityChange = (priority) => {
    onFiltersChange({
      ...filters,
      priority: filters.priority === priority ? 'All' : priority,
    });
  };

  const handleDueDateChange = (dueDate) => {
    onFiltersChange({
      ...filters,
      dueDate: filters.dueDate === dueDate ? 'all' : dueDate,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'All',
      priority: 'All',
      dueDate: 'all',
    });
  };

  const hasActiveFilters = 
    filters.status !== 'All' || 
    filters.priority !== 'All' || 
    filters.dueDate !== 'all';

  return (
    <div className="border-b border-neutral-800 bg-neutral-800/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-neutral-400" />
          <h3 className="font-semibold text-sm">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="text-xs font-medium text-neutral-300 block mb-2">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-xs font-medium text-neutral-300 block mb-2">Priority</label>
          <div className="flex flex-wrap gap-1.5">
            {priorityOptions.map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.priority === priority
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className="text-xs font-medium text-neutral-300 block mb-2">Due Date</label>
          <div className="flex flex-wrap gap-1.5">
            {dueDateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDueDateChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filters.dueDate === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-700">
          <span>Active filters: </span>
          {filters.status !== 'All' && <span className="text-blue-400">{filters.status}</span>}
          {filters.status !== 'All' && filters.priority !== 'All' && <span>, </span>}
          {filters.priority !== 'All' && <span className="text-blue-400">{filters.priority} priority</span>}
          {(filters.status !== 'All' || filters.priority !== 'All') && filters.dueDate !== 'all' && <span>, </span>}
          {filters.dueDate !== 'all' && <span className="text-blue-400">{filters.dueDate}</span>}
        </div>
      )}
    </div>
  );
}
