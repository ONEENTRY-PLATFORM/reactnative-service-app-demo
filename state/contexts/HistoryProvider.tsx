import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HistoryContextProps {
  lastVisitedTab: string | null;
  setLastVisitedTab: (tabName: string) => void;
}

const HistoryContext = createContext<HistoryContextProps | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastVisitedTab, setLastVisitedTab] = useState<string | null>(null);

  return (
    <HistoryContext.Provider value={{ lastVisitedTab, setLastVisitedTab }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistoryContext = (): HistoryContextProps => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};
