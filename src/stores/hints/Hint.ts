import { EMPTY } from "@/lib/constants";
import type { HintAction as createHintAction, HintAction, HintActionFn, HintSource, HintTarget, HintTargetLine, HintType, HintValidatorFn } from "./types.js";
import type { Vec } from "@/lib/types.js";
import type { DuplicateLineTechniqueResult } from "@/lib/human-solver/duplicate.js";
import { usePuzzleStore } from "../puzzle/store.js";
import { lineTypeFromLineId } from "@/lib/utils/puzzle-line.utils.js";

export const HINT_TYPE = {
	MISTAKE: 'MISTAKE',
	TRIPLES: 'TRIPLES',
	BALANCE: 'BALANCE',
	ELIMINATION: 'ELIMINATION',
	ELIM_DUPE: 'ELIM_DUPE'
} as const satisfies Record<HintType, HintType>;

export const HINT_TITLE = {
	MISTAKE: 'Mistake',
	TRIPLES: 'Max consecutive',
	BALANCE: 'Line balance',
	ELIMINATION: 'Elimination',
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

/* type WithoutSubType<T extends Hint> = Omit<T, 'subType'> & {
	subType?: undefined;
	subtitle?: undefined;
};
type WithoutTargetLine<T extends Hint> = Omit<T, 'targetLine'> & {
	targetLine?: undefined;
};
type WithHintType<T extends Hint, HType extends HintType> = Omit<T, 'type'> & {
	type: HType;
};
type WithHintSource<T extends Hint, HSource extends HintSource> = Omit<T, 'source'> & {
	source: HSource;
};

export type MistakeHint = WithHintType<
	WithHintSource<WithoutSubType<WithoutTargetLine<Hint>>, Vec[]>,
	'MISTAKE'
>;
export type TriplesHint = WithHintType<
	WithHintSource<WithoutTargetLine<Hint>, [Vec, Vec]>,
	'TRIPLES'
>;
export type BalanceHint = WithHintType<
	WithHintSource<WithoutTargetLine<WithoutSubType<Hint>>, LineId[]>,
	'BALANCE'
>;
export type EliminationHint = WithHintType<
	WithHintSource<WithoutTargetLine<Hint>, LineId[]>,
	'ELIMINATION'
>;
export type ElimDupeHint = WithHintType<
	WithHintSource<Hint, LineId[]>,
	'ELIM_DUPE'
>; */

const createHintAction = (label: string, fn: HintActionFn): HintAction => ({ label, fn });
const hintActions: Record<HintType, HintAction> = {
	[HINT_TYPE.MISTAKE]: createHintAction('Fix', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		puzzleStore.makeMultipleMoves(targets, { historyCommitType: "reset" });
	}),
	[HINT_TYPE.TRIPLES]: createHintAction('Execute', (hint) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		const moves = hint.targets.filter(t => {
			const boardValue = board!.get(t.x, t.y);
			return boardValue === EMPTY;			
		})
		puzzleStore.makeMultipleMoves(moves, { historyCommitType: "commitCombined" });
	}),
	[HINT_TYPE.BALANCE]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		const moves = targets.filter(t => {
			const boardValue = board!.get(t.x, t.y);
			return boardValue === EMPTY;			
		})
		puzzleStore.makeMultipleMoves(moves, { historyCommitType: "commitCombined" });
	}),
	[HINT_TYPE.ELIMINATION]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		const moves = targets.filter(t => {
			const boardValue = board!.get(t.x, t.y);
			return boardValue === EMPTY;			
		})
		puzzleStore.makeMultipleMoves(moves, { historyCommitType: "commitCombined" });
	}),
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

const createMistakeHint = (cells: Vec[]) => {
	const message = cells.length > 1 ?
		"It seems you've made some mistakes." :
		"It seems you've made a mistake.";
	const targets = [...cells].map((vec): HintTarget => {
		return { ...vec, value: EMPTY }
	});
	const hint = new Hint(
		HINT_TYPE.MISTAKE,
		message,
		targets,
	);
	const hintValidator: HintValidatorFn = ({ board, solution }) => {
		for (const { x, y } of targets) {
			const boardValue = board.get(x, y);
			const solutionValue = solution.get(x, y);
			if (boardValue !== solutionValue && boardValue !== EMPTY) return true;
		}
		return false;
	}
	hint.setValidator(hintValidator);
	console.log({ type: 'mistake', hint });
	return hint;
}

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
	[HINT_TYPE.MISTAKE]: createMistakeHint,
	[HINT_TYPE.ELIM_DUPE]: createElimDupeHint
}

function titleCase<Str extends string>(str: Str): Capitalize<Str> {
	return str[0].toUpperCase() + str.slice(1) as Capitalize<Str>;
}