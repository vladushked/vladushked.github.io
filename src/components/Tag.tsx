export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-mono border border-border rounded bg-white">
      {children}
    </span>
  );
}
