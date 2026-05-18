import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UIContextType {
  showDiscovery: boolean;
  setShowDiscovery: (show: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  bookmarks: string[];
  toggleBookmark: (scpId: string) => void;
  clearBookmarks: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem('scp_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  const toggleBookmark = (scpId: string) => {
    setBookmarks(prev => {
      const next = prev.includes(scpId) 
        ? prev.filter(id => id !== scpId) 
        : [...prev, scpId];
      localStorage.setItem('scp_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('scp_bookmarks');
  };

  return (
    <UIContext.Provider value={{ 
      showDiscovery, 
      setShowDiscovery, 
      isAdmin, 
      setIsAdmin,
      isMenuOpen,
      setIsMenuOpen,
      bookmarks,
      toggleBookmark,
      clearBookmarks
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
