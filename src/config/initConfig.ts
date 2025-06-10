import { appConfig } from './appConfig';

// Initialize configuration
export function initializeConfig() {
  // Load any stored configuration
  appConfig.loadStoredConfig();

  // Validate the configuration
  const { isValid, errors } = appConfig.validateConfig();
  
  if (!isValid) {
    console.warn('Configuration validation failed:', errors);
  }

  // Return the validation result
  return { isValid, errors };
}

// Export the config instance for use in components
export { appConfig }; 