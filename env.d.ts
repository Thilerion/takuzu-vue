/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import 'pinia';
declare module 'pinia' {
	export interface PiniaCustomProperties {
		i18n: import('./src/i18n/index.js').AppI18n['global'];
	}
}

export type AppMode = 'alpha' | 'beta' | 'development' | 'production' | 'test';

interface ImportMetaEnv {
  // more env variables...
  readonly VITE_APP_TITLE: string,
  readonly VITE_APP_NAME: string,
  readonly VITE_APP_SHORT_NAME: string,
  readonly MODE: AppMode
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  import type { BuildVersionDetails } from "scripts/build-metadata.js";
  const __BUILD_VERSION_DETAILS__: BuildVersionDetails;
}
export {};