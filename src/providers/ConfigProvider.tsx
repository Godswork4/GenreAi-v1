import React, { createContext, useContext, ReactNode } from 'react';
import { useAppConfig } from '../hooks/useAppConfig';

interface ConfigContextType {
  config: ReturnType<typeof useAppConfig>['config'];
  updateConfig: ReturnType<typeof useAppConfig>['updateConfig'];
  validateConfig: ReturnType<typeof useAppConfig>['validateConfig'];
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const { config, updateConfig, validateConfig } = useAppConfig();

  return (
    <ConfigContext.Provider value={{ config, updateConfig, validateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
} 