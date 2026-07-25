import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">Oops, something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              We encountered a runtime crash. Don't worry, your shopping bag is safe. Please click below to refresh the page.
            </p>
            
            {this.state.error && (
              <pre className="text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-mono mb-6 max-h-36 overflow-auto border border-slate-100 dark:border-slate-900">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium shadow-md transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
