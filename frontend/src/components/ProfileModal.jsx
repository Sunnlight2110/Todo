import React from 'react';
import { X, User, Mail, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700 bg-neutral-800/50">
          <h2 className="text-lg font-semibold text-white">Your Profile</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Close profile modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-400">Welcome back</p>
              <h3 className="text-xl font-semibold text-white">{user?.username}</h3>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <User size={18} className="text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">Username</p>
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <Mail size={18} className="text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">Email</p>
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <Hash size={18} className="text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-neutral-400">User ID</p>
                <p className="text-sm font-medium text-white font-mono">{user?.id}</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              Your profile information is loaded from your account and stored securely.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-700 bg-neutral-800/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
