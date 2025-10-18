import React from 'react';

// FIX: Use React.PropsWithChildren to correctly type props for a component that wraps children.
// This resolves the error in index.tsx where TypeScript incorrectly assumes no children are provided.
type Props = React.PropsWithChildren<{}>;
type State = { hasError: boolean; error?: Error; info?: { componentStack: string } };

export default class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Explicitly declare the state property on the class before initializing it in the constructor.
  // This ensures the TypeScript compiler recognizes `this.state` as a valid property,
  // which resolves the cascading type errors for both `this.state` and `this.props`.
  state: State;
  // FIX: Explicitly declare props to follow the pattern for state, resolving the "Property 'props' does not exist" error.
  readonly props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Persist last error for Diagnostics page
    try {
      localStorage.setItem(
        'lastRenderError',
        JSON.stringify({ message: error.message, stack: error.stack, info: info.componentStack, ts: new Date().toISOString() })
      );
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="mt-2 text-gray-600">The page crashed during rendering. Please open <code>/diagnostics</code> for details.</p>
          <a href="/#/diagnostics" className="inline-block mt-4 px-4 py-2 bg-gray-800 text-white rounded">Open Diagnostics</a>
        </div>
      );
    }
    return this.props.children;
  }
}
