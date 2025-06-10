import { useState, useEffect } from 'react';
import { appConfig } from '../config/appConfig';

export function useAppConfig() {
  const [config, setConfig] = useState(appConfig.getConfig());

  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      setConfig(event.detail);
    };

    // Listen for config updates
    window.addEventListener('app_config_updated', handleConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('app_config_updated', handleConfigUpdate as EventListener);
    };
  }, []);

  const updateConfig = (newConfig: Parameters<typeof appConfig.updateConfig>[0]) => {
    appConfig.updateConfig(newConfig);
  };

  const validateConfig = () => {
    return appConfig.validateConfig();
  };

  return {
    config,
    updateConfig,
    validateConfig,
  };
} 