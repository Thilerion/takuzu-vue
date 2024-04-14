import { usePuzzleStore } from "../puzzle/store.js";
import type { SteppedHint } from "./stepped-hint/types.js";

export function validateHint(hint: SteppedHint) {
	// TODO: remove this function, no longer useful with legacy hint type removed
	if (hint.isSteppedHint) {
		const store = usePuzzleStore();
		const ctx = { board: store.board!, solution: store.solution! };
		return hint.validate(ctx);
	}
	// TODO: before hintValidator (except mistake), check that there are no mistakes first
	return false;
}