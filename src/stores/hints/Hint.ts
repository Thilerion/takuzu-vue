import { EMPTY } from "@/lib/constants";
import type { HintAction as createHintAction, HintAction, HintActionFn, HintSource, HintTarget, HintTargetLine, HintType, HintValidatorFn } from "./types.js";
import type { DuplicateLineTechniqueResult } from "@/lib/human-solver/duplicate.js";
import { usePuzzleStore } from "../puzzle/store.js";
import { lineTypeFromLineId } from "@/lib/utils/puzzle-line.utils.js";

export const HINT_TYPE = {
	ELIM_DUPE: 'ELIM_DUPE'
} as const satisfies Record<HintType, HintType>;

export const HINT_TITLE = {
	ELIM_DUPE: 'Unique lines'
} satisfies Record<HintType, string>;

let lastHintId = -1;

export type HintCtorCtxParam = {
	subType: string;
	actions: createHintAction[];
	targetLine: HintTargetLine;
}
export class Hint {
	id: number;
	type: HintType;
	message: string;
	targets: HintTarget[];
	source: HintSource;
	subType?: string;
	actions?: createHintAction[];
	targetLine?: HintTargetLine;
	title: string;
	subtitle?: string;
	validator: HintValidatorFn;

	constructor(type: HintType, message: string, targets: HintTarget[], source: HintSource = [], context: Partial<HintCtorCtxParam> = {}) {
		this.id = ++lastHintId;

		this.type = type;
		this.message = message;
		this.targets = targets;
		this.source = source;

		const { subType, actions, targetLine } = context;
		this.subType = subType;
		this.actions = actions ?? [hintActions[this.type]];
		this.targetLine = targetLine;

		this.title = HINT_TITLE[type] ?? 'Hint';
		this.subtitle = this.subType;

		this.validator = () => false;
	}

	get isLegacyHint(): true {
		return true;
	}

	setValidator(fn: HintValidatorFn) {
		this.validator = fn;
		return this;
	}
}

const createHintAction = (label: string, fn: HintActionFn): HintAction => ({ label, fn });
const hintActions: Record<HintType, HintAction> = {
	[HINT_TYPE.ELIM_DUPE]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		const moves = targets.filter(t => {
			const boardValue = board!.get(t.x, t.y);
			return boardValue === EMPTY;			
		})
		puzzleStore.makeMultipleMoves(moves, { historyCommitType: "commitCombined" });
	})
};

const createElimDupeHint = ({ targets, source, elimType, targetLine }: DuplicateLineTechniqueResult) => {
	const lineId = targetLine;
	const lineName = lineTypeFromLineId(lineId);
	const sourceLines = source.join(',');
	const message = `${titleCase(lineName)} ${lineId} has potential duplicate ${lineName}s: "${sourceLines}". Values can be eliminated from this ${lineName}.`;
	const subType = elimType;
	const hint = new Hint(
		HINT_TYPE.ELIM_DUPE,
		message,
		targets,
		source,
		{ subType, targetLine }
	);
	console.log({ type: 'elim dupe', hint })
	return hint;
}

export const hintGenerators = {
	[HINT_TYPE.ELIM_DUPE]: createElimDupeHint
}

function titleCase<Str extends string>(str: Str): Capitalize<Str> {
	return str[0].toUpperCase() + str.slice(1) as Capitalize<Str>;
}