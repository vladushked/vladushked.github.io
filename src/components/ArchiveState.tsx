import { createContext, useContext, type ReactNode } from "react";
export type ArchiveSelections = Record<string, string[]>;
const ArchiveState = createContext<{
  selections: ArchiveSelections;
  onChange: (feed: string, value: string[]) => void;
}>({ selections: {}, onChange: () => {} });
export function ArchiveProvider({
  children,
  selections,
  onChange,
}: {
  children: ReactNode;
  selections: ArchiveSelections;
  onChange: (feed: string, value: string[]) => void;
}) {
  return (
    <ArchiveState.Provider value={{ selections, onChange }}>
      {children}
    </ArchiveState.Provider>
  );
}
export function useArchiveTopics(feed: string) {
  const state = useContext(ArchiveState);
  return [
    state.selections[feed] ?? [],
    (value: string[]) => state.onChange(feed, value),
  ] as const;
}
