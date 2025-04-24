"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface PaymentConfig {
  isStripeConfigured: boolean;
  isCoinbaseConfigured: boolean;
}

const PaymentConfigContext = createContext<PaymentConfig | undefined>(undefined);

interface PaymentConfigProviderProps {
  children: ReactNode;
  config: PaymentConfig;
}

export const PaymentConfigProvider = ({ children, config }: PaymentConfigProviderProps) => {
  return (
    <PaymentConfigContext.Provider value={config}>
      {children}
    </PaymentConfigContext.Provider>
  );
};

export const usePaymentConfig = (): PaymentConfig => {
  const context = useContext(PaymentConfigContext);
  if (context === undefined) {
    throw new Error('usePaymentConfig must be used within a PaymentConfigProvider');
  }
  return context;
}; 