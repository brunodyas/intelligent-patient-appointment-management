"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NewContact, CRMContact } from '@/interface/contacts';

interface ContactContextType {
  selectedContact:  CRMContact | NewContact  | undefined;
  setSelectedContact: (Contact:  CRMContact | NewContact | undefined) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedContact, setSelectedContact] = useState<NewContact | CRMContact | undefined>();

  return (

    <ContactContext.Provider value={{ selectedContact, setSelectedContact }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useSelectContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useSelectCompany must be used within a CompanyProvider');
  }
  return context;
};

export default ContactProvider;
