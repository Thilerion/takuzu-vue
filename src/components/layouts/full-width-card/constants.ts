import type { InjectionKey, MaybeRef } from "vue";

export type PaddingXClassValue = `px-${number}` | `${string}:px-${number}`;
export const PaddingXInjectKey = Symbol('FwCardLayoutPaddingX') as InjectionKey<MaybeRef<PaddingXClassValue>>;
export const PADDING_X_CLASS_DEFAULT = 'px-6';