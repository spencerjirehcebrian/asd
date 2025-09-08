/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_GITHUB_TOKEN?: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}