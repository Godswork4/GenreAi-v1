interface EnvConfig {
  walletConnect: {
    projectId: string;
  };
  network: {
    trnRpcUrl: string;
    rootNetworkApiUrl: string;
  };
  ai: {
    asmBrainApiUrl: string;
    openAiKey: string;
  };
  futurePass: {
    apiUrl: string;
    clientId: string;
    accessToken: string;
  };
}

class AppConfigService {
  private static instance: AppConfigService;
  private config: EnvConfig;

  private constructor() {
    // Initialize with environment variables
    this.config = {
      walletConnect: {
        projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '',
      },
      network: {
        trnRpcUrl: import.meta.env.VITE_TRN_RPC_URL || '',
        rootNetworkApiUrl: import.meta.env.VITE_ROOT_NETWORK_API_URL || '',
      },
      ai: {
        asmBrainApiUrl: import.meta.env.VITE_ASM_BRAIN_API_URL || '',
        openAiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      },
      futurePass: {
        apiUrl: import.meta.env.VITE_FUTUREPASS_API_URL || 'https://auth.reown.com',
        clientId: import.meta.env.VITE_FUTURE_PASS_CLIENT_ID || '',
        accessToken: import.meta.env.VITE_FUTUREPASS_ACCESS_TOKEN || '',
      },
    };

    // Try to load stored config
    this.loadStoredConfig();
  }

  public static getInstance(): AppConfigService {
    if (!AppConfigService.instance) {
      AppConfigService.instance = new AppConfigService();
    }
    return AppConfigService.instance;
  }

  public getConfig(): EnvConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<EnvConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('app_config', JSON.stringify(this.config));
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('app_config_updated', { detail: this.config }));
  }

  public loadStoredConfig(): void {
    const storedConfig = localStorage.getItem('app_config');
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        this.config = {
          ...this.config,
          ...parsedConfig,
        };
      } catch (error) {
        console.error('Failed to parse stored config:', error);
      }
    }
  }

  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredFields = {
      'WalletConnect Project ID': this.config.walletConnect.projectId,
      'TRN RPC URL': this.config.network.trnRpcUrl,
      'Root Network API URL': this.config.network.rootNetworkApiUrl,
      'FuturePass Client ID': this.config.futurePass.clientId,
      'FuturePass Access Token': this.config.futurePass.accessToken,
    };

    Object.entries(requiredFields).forEach(([name, value]) => {
      if (!value) {
        errors.push(`${name} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Helper method to get FuturePass config
  public getFuturePassConfig() {
    return this.config.futurePass;
  }

  // Helper method to get Network config
  public getNetworkConfig() {
    return this.config.network;
  }

  // Helper method to get AI config
  public getAIConfig() {
    return this.config.ai;
  }

  // Helper method to get WalletConnect config
  public getWalletConnectConfig() {
    return this.config.walletConnect;
  }
}

// Create and export the singleton instance
export const appConfig = AppConfigService.getInstance();

// Add environment variable types
interface ImportMetaEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID?: string;
  readonly VITE_TRN_RPC_URL?: string;
  readonly VITE_ROOT_NETWORK_API_URL?: string;
  readonly VITE_ASM_BRAIN_API_URL?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_FUTUREPASS_API_URL?: string;
  readonly VITE_FUTURE_PASS_CLIENT_ID?: string;
  readonly VITE_FUTUREPASS_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 