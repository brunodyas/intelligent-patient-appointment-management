"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NewCompany, CRMCompany } from '@/interface/companies';

interface CompanyContextType {
  skipCompany: boolean;
  selectedCompany:  CRMCompany | NewCompany  | undefined;
  setSelectedCompany: (company:  CRMCompany | NewCompany | undefined) => void;
  setSkipCompany: (skip: boolean) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<NewCompany | CRMCompany | undefined>();
  const [skipCompany, setSkipCompany] = useState(false);

  return (
    <CompanyContext.Provider value={{ skipCompany, selectedCompany, setSelectedCompany, setSkipCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useSelectCompany = () => {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useSelectCompany must be used within a CompanyProvider');
  }
  
  return context;
};

export default CompanyProvider;
