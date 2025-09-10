import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  isAnyModalOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  registerModal: (modalId: string) => void;
  // eslint-disable-next-line no-unused-vars
  unregisterModal: (modalId: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const registerModal = useCallback((modalId: string) => {
    setOpenModals(prev => new Set(prev).add(modalId));
  }, []);

  const unregisterModal = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(modalId);
      return newSet;
    });
  }, []);

  const isAnyModalOpen = openModals.size > 0;

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, registerModal, unregisterModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalContextProvider');
  }
  return context;
};