import React from 'react';

type Props = React.PropsWithChildren<{}>;
type State = { hasError: boolean; error?: Error; info?: { componentStack: string } };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info: { componentStack: info.componentStack } as any });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto' }}>
          <h1>Something went wrong</h1>
          <p>The UI failed to render. You can reload the page, or send this error to devs.</p>
          {this.state.error && (
            <>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
                {String(this.state.error.stack || this.state.error.message)}
              </pre>
            </>
          )}
          {this.state.info?.componentStack && (
            <details open>
              <summary>Component stack</summary>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
                {this.state.info.componentStack}
              </pre>
            </details>
          )}
          <button onClick={() => window.location.reload()} style={{ marginTop: 12 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
