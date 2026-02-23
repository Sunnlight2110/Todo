import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * Renders the provided component only if the user is authenticated
 * Redirects to login if not authenticated
 * Shows a loading state while auth is being initialized
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized, loading } = useAuth();

  // Still initializing auth state
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin">
            <div className="w-10 h-10 border-2 border-neutral-700 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-neutral-400 text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, show nothing (App.jsx will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated, render the protected content
  return children;
}
