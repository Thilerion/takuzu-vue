import { type Ref, type InjectionKey, provide, inject, readonly } from "vue";

export type BaseCollapsibleProvided = {
	isOpen: Readonly<Ref<boolean>>,
	toggle: () => void,
	setOpen: () => void,
	setClosed: () => void,
};
const key = Symbol('BaseCollapsible') as InjectionKey<BaseCollapsibleProvided>;

export const ProvideCollapsibleContext = (
	isOpen: Ref<boolean>,
	setIsOpen: (val: boolean) => void
) => {
	const toggle = () => setIsOpen(!isOpen.value);
	const setOpen = () => setIsOpen(true);
	const setClosed = () => setIsOpen(false);

	provide(key, {
		isOpen: readonly(isOpen),
		toggle,
		setOpen,
		setClosed,
	})

	return { toggle, setOpen, setClosed }
}

export const useCollapsible = (): BaseCollapsibleProvided => {
	const data = inject(key);
	if (data == null) {
		throw new Error('No collapsible context found. Did you forget to use the "BaseCollapsible" component?');
	}
	return data;
}