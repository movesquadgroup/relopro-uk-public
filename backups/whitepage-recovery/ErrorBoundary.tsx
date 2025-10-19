import React from 'react';

type Props = React.PropsWithChildren<{}>;
type State = { hasError: boolean; error?: Error; info?: { componentStack: string } };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  readonly props: Props;

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info: { componentStack: info.componentStack } });
    // Also log to console so we can see exact stack
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    // simple reset to re-mount tree
    this.setState({ hasError: false, error: undefined, info: undefined });
    location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        padding: 24, lineHeight: 1.5, maxWidth: 900, margin: '48px auto'
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Something went wrong</h1>
        <p style={{ marginTop: 8, opacity: 0.9 }}>
          The UI failed to render. You can reload the page, or send this error to devs.
        </p>

        {this.state.error && (
          <pre style={{
            whiteSpace: 'pre-wrap',
            background: '#0f172a', color: '#e2e8f0',
            padding: 12, borderRadius: 8, marginTop: 16, overflow: 'auto'
          }}>
{String(this.state.error.stack || this.state.error.message)}
          </pre>
        )}

        {this.state.info?.componentStack && (
          <>
            <h3 style={{ marginTop: 24 }}>Component stack</h3>
            <pre style={{
              whiteSpace: 'pre-wrap',
              background: '#111827', color: '#d1d5db',
              padding: 12, borderRadius: 8, marginTop: 8, overflow: 'auto'
            }}>
{this.state.info.componentStack}
            </pre>
          </>
        )}

        <button
          onClick={this.handleReload}
          style={{
            marginTop: 24, padding: '10px 14px', borderRadius: 8,
            border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer'
          }}
        >
          Reload app
        </button>
      </div>
    );
  }
}
