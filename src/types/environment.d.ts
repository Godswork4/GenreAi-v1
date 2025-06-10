/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_OPENAI_API_KEY: string;
    VITE_TRN_RPC_URL: string;
    VITE_FUTUREPASS_API_URL: string;
    VITE_FUTUREPASS_CLIENT_ID: string;
    VITE_FUTUREPASS_ACCESS_TOKEN: string;
    VITE_WALLET_CONNECT_PROJECT_ID: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_TRN_RPC_URL: string;
  readonly VITE_FUTUREPASS_API_URL: string;
  readonly VITE_FUTUREPASS_CLIENT_ID: string;
  readonly VITE_FUTUREPASS_ACCESS_TOKEN: string;
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
  readonly MODE: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 