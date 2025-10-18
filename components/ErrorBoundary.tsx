import React from 'react';

type Props = React.PropsWithChildren<{}>;
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: (err as Error)?.message || String(err) };
  }

  componentDidCatch(err: unknown, info: any) {
    console.error('Boundary caught:', err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{padding:24,fontFamily:'system-ui',color:'#0f172a'}}>
        <h1 style={{fontSize:20,marginBottom:8}}>Something went wrong</h1>
        <p style={{opacity:.8,margin:'8px 0'}}>Try reload (⌘R). If it persists, open Settings → Diagnostics.</p>
        <pre style={{background:'#f1f5f9',padding:12,borderRadius:8,whiteSpace:'pre-wrap'}}>{this.state.message}</pre>
      </div>
    );
  }
}
