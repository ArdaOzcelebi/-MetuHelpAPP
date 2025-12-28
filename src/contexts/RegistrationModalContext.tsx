import React, { createContext, useContext, useState, ReactNode } from "react";

interface RegistrationModalContextType {
  showModal: () => void;
  hideModal: () => void;
  isVisible: boolean;
}

const RegistrationModalContext = createContext<
  RegistrationModalContextType | undefined
>(undefined);

export const RegistrationModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return (
    <RegistrationModalContext.Provider
      value={{ showModal, hideModal, isVisible }}
    >
      {children}
    </RegistrationModalContext.Provider>
  );
};

export const useRegistrationModal = () => {
  const context = useContext(RegistrationModalContext);
  if (!context) {
    throw new Error(
      "useRegistrationModal must be used within RegistrationModalProvider",
    );
  }
  return context;
};
