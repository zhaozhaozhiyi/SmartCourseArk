/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KIMI_API_KEY: string
  readonly VITE_KIMI_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_BASE_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
