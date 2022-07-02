/// <reference types="vite/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  // more env variables...
  readonly VITE_APP_TITLE: string,
  readonly VITE_APP_NAME: string,
  readonly VITE_APP_SHORT_NAME: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __PKG_VERSION__: string;
declare const __BUILD_DATE__: string;