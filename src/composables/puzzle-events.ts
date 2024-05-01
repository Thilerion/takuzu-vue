import type { VecValueChange } from "@/lib/types.js";
import { createSharedComposable, tryOnScopeDispose } from "@vueuse/core";
import mitt, { type Handler } from "mitt";

export type PuzzleEvents = {
	"value-change": VecValueChange;
	"pause": void;
	"resume": void;
}
const emitter = mitt<PuzzleEvents>();

/**
 * Registers a handler for a specific puzzle event. The handler will be called whenever the event is emitted.
 * When this function is called from a component, the handler will be removed when the component is unmounted.
 * 
 * @param event The event to listen for
 * @param handler The handler to call when the event is emitted
 * @returns A cleanup function that will remove the handler when called
 */
export const usePuzzleEvent = <Key extends keyof PuzzleEvents>(
	event: Key,
	handler: Handler<PuzzleEvents[Key]>
): () => void => {
	emitter.on(event, handler);
	const cleanup = () => emitter.off(event, handler);
	tryOnScopeDispose(() => {
		cleanup();
	})
	return cleanup;
}

type HandlerMap<Key extends keyof PuzzleEvents> = {
	[key in Key]: Handler<PuzzleEvents[key]>;
}

/**
 * Registers multiple handlers for multiple puzzle events. The handlers will be called whenever the corresponding event is emitted.
 * When this function is called from a component, the handlers will be removed when the component is unmounted.
 * This function is a simpler way to register multiple handlers than calling usePuzzleEvent multiple times.
 * 
 * @param handlerMap An object mapping event names to handlers
 * @returns A cleanup function that will remove all handlers when called
 */
export const usePuzzleEvents = <Key extends keyof PuzzleEvents>(
	handlerMap: HandlerMap<Key>
) => {
	const clonedMap = {...handlerMap}; // to prevent cleanup from failing if handlerMap is mutated
	const keys = [...Object.keys(handlerMap)] as Key[];
	for (const key of keys) {
		emitter.on(key, handlerMap[key]);
	}
	function cleanup() {
		for (const key of keys) {
			emitter.off(key, clonedMap[key]);
		}
	}
	tryOnScopeDispose(cleanup);
	return cleanup;
}

export const usePuzzleEventEmitter = createSharedComposable(() => {
	const emit = emitter.emit.bind(emitter);
	// const all = emitter.all;
	const reset = () => emitter.all.clear();

	return {
		emit,
		reset,
	}
})