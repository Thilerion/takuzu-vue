import { type Ref, type InjectionKey, provide, inject, readonly } from "vue";

export type BaseCollapsibleProvided = {
	isOpen: Readonly<Ref<boolean>>,
	toggle: () => void,
	setOpen: () => void,
	setClosed: () => void,
	transitionHooks: {
		afterLeave: () => void,
		afterEnter: () => void,
	}
};
const key = Symbol('BaseCollapsible') as InjectionKey<BaseCollapsibleProvided>;

export type BaseCollapsibleEmits = {
	(e: 'toggled', toValue: boolean): void;
	(e: 'close'): void;
	(e: 'open'): void;
	(e: 'afterClose'): void;
	(e: 'afterOpen'): void;
}

export const ProvideCollapsibleContext = (
	isOpen: Ref<boolean>,
	emit: BaseCollapsibleEmits
) => {
	const setIsOpen = (val: boolean) => {
		emit('toggled', val);
		if (val) emit('open');
		else emit('close');
		isOpen.value = val;
	}
	const toggle = () => setIsOpen(!isOpen.value);
	const setOpen = () => setIsOpen(true);
	const setClosed = () => setIsOpen(false);

	const onTransitionAfterEnter = () => {
		emit('afterOpen');
	}
	const onTransitionAfterLeave = () => {
		emit('afterClose');
	}
	const transitionHooks = {
		afterLeave: onTransitionAfterLeave,
		afterEnter: onTransitionAfterEnter,
	}

	provide(key, {
		isOpen: readonly(isOpen),
		toggle,
		setOpen,
		setClosed,
		transitionHooks,
	})

	return { toggle, setOpen, setClosed, onTransitionAfterEnter, onTransitionAfterLeave };
}

export const useCollapsible = (): BaseCollapsibleProvided => {
	const data = inject(key);
	if (data == null) {
		throw new Error('No collapsible context found. Did you forget to use the "BaseCollapsible" component?');
	}
	return data;
}