import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 * Prevents full app crash from component errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-neutral-950 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-red-500/30 rounded-lg p-6 max-w-md">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-300 mb-2">Something went wrong</h2>
                <p className="text-sm text-neutral-400">
                  An unexpected error occurred. Please refresh the page to continue.
                </p>
              </div>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-neutral-800/50 rounded border border-neutral-700 text-xs text-neutral-300">
                <summary className="cursor-pointer font-mono text-red-300">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 overflow-auto max-h-40 text-red-200">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
