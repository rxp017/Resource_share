import React, { Component, type ReactNode } from 'react';
import { AlertCircleIcon } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Unhandled UI exception in ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main
          id="main-content"
          role="alert"
          style={{
            maxWidth: '520px',
            margin: '80px auto',
            padding: '32px 20px',
            textAlign: 'center',
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '40px 24px',
              borderRadius: 'var(--radius-card, 12px)',
              border: '1px solid var(--color-danger, #B91C1C)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'color-mix(in srgb, var(--color-danger, #B91C1C) 12%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
              aria-hidden="true"
            >
              <AlertCircleIcon size={32} color="var(--color-danger, #B91C1C)" />
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-danger, #B91C1C)',
                marginBottom: '10px',
              }}
            >
              Application Error
            </h1>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              An unexpected interface error occurred. Your campus session data is safe. Please reload the application to continue.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="interactive-btn btn-primary"
              style={{
                padding: '12px 28px',
                fontWeight: 700,
              }}
            >
              Reload Application
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
