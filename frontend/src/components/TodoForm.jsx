import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

export default function TodoForm({ onSubmit, onCancel, initialData = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    notes: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    priority: 'Medium'
  });

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        notes: initialData.notes || '',
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        status: initialData.status || 'Pending',
        priority: initialData.priority || 'Medium'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.notes.trim()) {
      alert('Please enter a todo description');
      return;
    }
    
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Todo' : 'Create New Todo'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Notes/Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Task Description *
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What do you need to do?"
              disabled={isLoading}
              rows="3"
              className="w-full bg-neutral-800 text-neutral-100 px-4 py-2.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-neutral-500 disabled:opacity-50"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-neutral-800 text-neutral-100 px-4 py-2.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
            />
          </div>

          {/* Status and Priority in two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-neutral-800 text-neutral-100 px-4 py-2.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-neutral-800 text-neutral-100 px-4 py-2.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {initialData ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
