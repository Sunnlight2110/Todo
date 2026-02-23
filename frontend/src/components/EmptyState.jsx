import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';

export default function EmptyState({ onCreateTodo }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-6 px-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-blue-400" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">No todos yet</h3>
          <p className="text-sm text-neutral-400">
            Get started by creating your first todo. Stay organized and boost your productivity!
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onCreateTodo}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 active:scale-95"
        >
          <Plus size={18} />
          Create your first todo
        </button>

        {/* Helpful hint */}
        <p className="text-xs text-neutral-500">
          You can also use the "+ Add New Todo" button in the header anytime
        </p>
      </div>
    </div>
  );
}
