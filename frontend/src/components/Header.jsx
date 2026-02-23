import React, { useState, useRef, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ isOnline, isRefreshing, onRefresh, onLogout }) {
  const { user, setShowProfileModal } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Todo Assistant</h1>
            <p className="text-xs text-neutral-400">Manage your tasks with AI</p>
          </div>
        </div>

        {/* Right Section - Status, Refresh, Profile, Logout */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <Wifi size={16} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <WifiOff size={16} className="text-red-400" />
              <span className="text-xs text-red-400 font-medium">Offline</span>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white transition-all text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 transition-all text-sm font-medium"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user?.username}</span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-neutral-700 bg-neutral-900/50">
                  <p className="text-xs text-neutral-400 mb-1">Logged in as</p>
                  <p className="text-sm font-medium text-white break-words">{user?.username}</p>
                  {user?.email && (
                    <p className="text-xs text-neutral-400 mt-1 break-words">{user.email}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700/50 transition-colors flex items-center gap-2"
                  >
                    <User size={16} />
                    View Profile
                  </button>
                </div>

                {/* Logout */}
                <div className="px-2 py-2 border-t border-neutral-700">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 rounded"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
