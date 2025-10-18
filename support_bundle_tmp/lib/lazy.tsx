import React from "react";

export function lazyIfEnabled<T extends React.ComponentType<any>>(
  enabled: boolean,
  loader: () => Promise<{ default: T }>,
  Fallback: React.ReactNode = null
): React.ComponentType<any> {
  if (!enabled) return () => <>{Fallback}</>;
  const LazyComp = React.lazy(loader);
  const SafeComp = (props: any) => (
    <React.Suspense fallback={Fallback}>
      <LazyComp {...props} />
    </React.Suspense>
  );
  return SafeComp;
}

// NEW helper: safeImport()
export async function safeImport<T>(
  path: string
): Promise<{ default: React.ComponentType<T> }> {
  try {
    // @ts-ignore dynamic import
    return await import(/* @vite-ignore */ path);
  } catch (e) {
    console.warn("⚠️ safeImport failed:", path, e);
    return { default: () => <div className="text-red-500 text-sm">Missing: {path}</div> };
  }
}
