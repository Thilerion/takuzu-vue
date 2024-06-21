import { isRef, ref, type MaybeRef } from "vue";

export type CollapseTransitionEmits = {
	(e: 'after-enter'): void;
	(e: 'after-leave'): void;
}

export const useCollapseTransition = (
	_expectedHeight: MaybeRef<number>,
	emit: CollapseTransitionEmits
) => {
	// A "best guess" as to the height of the (expanded) element
	const expectedHeight = isRef(_expectedHeight) ? _expectedHeight : ref(_expectedHeight);

	const onEnter = (el: HTMLElement) => {
		const rect = el.getBoundingClientRect();	
		el.style.width = rect.width + 'px';
		el.style.position = 'absolute';
		el.style.visibility = 'hidden';
		el.style.height = 'auto';

		const height = getComputedStyle(el).height;
		expectedHeight.value = parseFloat(height.slice(0, -2));
		el.style.width = '';
		el.style.position = '';
		el.style.visibility = '';
		el.style.height = '0';

		// force repaint
		getComputedStyle(el).height;

		el.style.height = height;
	}

	const onAfterEnter = (el: HTMLElement) => {
		el.style.height = 'auto';
		emit('after-enter');
	}

	const onLeave = (el: HTMLElement) => {
		const rect = el.getBoundingClientRect();
		expectedHeight.value = rect.height;

		el.style.height = rect.height + 'px';

		// force repaint
		getComputedStyle(el).height;

		el.style.height = '0px';
	}

	const onAfterLeave = () => {
		emit('after-leave');
	}

	return {
		expectedHeight,

		onEnter,
		onAfterEnter,
		onLeave,
		onAfterLeave,
	}
}