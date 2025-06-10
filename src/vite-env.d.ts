/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_TRN_RPC_URL: string
  readonly VITE_FUTUREPASS_API_URL: string
  readonly VITE_FUTUREPASS_CLIENT_ID: string
  readonly VITE_FUTUREPASS_ACCESS_TOKEN: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly MODE: string
  readonly DEV: boolean
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ROOT_NETWORK_API_URL: string
  readonly VITE_ASM_BRAIN_API_URL: string
  readonly VITE_FUTURE_PASS_CLIENT_ID: string
  readonly PACKAGE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg?react' {
  import React = require('react');
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}