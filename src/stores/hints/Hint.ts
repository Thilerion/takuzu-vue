import { EMPTY } from "@/lib/constants";
import { lineTypeFromLineId } from "@/lib/utils";
import type { HintAction as createHintAction, HintAction, HintActionFn, HintSource, HintTarget, HintTargetLine, HintType, HintValidatorFn } from "./types.js";
import type { Vec } from "@/lib/types.js";
import type { TriplesTechniqueResult } from "@/lib/human-solver/triples.js";
import type { BalanceTechniqueResult } from "@/lib/human-solver/balance.js";
import type { ElimTechniqueResult } from "@/lib/human-solver/elimination.js";
import type { DuplicateLineTechniqueResult } from "@/lib/human-solver/duplicate.js";
import { usePuzzleStore } from "../puzzle/store.js";

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
		targets.forEach(target => {
			const { x, y } = target;
			puzzleStore.makeMove({ x, y, value: EMPTY });
		})
	}),
	[HINT_TYPE.TRIPLES]: createHintAction('Execute', (hint) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		hint.targets.forEach(({ x, y, value }) => {
			const boardValue = board!.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.makeMove({ x, y, value });
		})
	}),
	[HINT_TYPE.BALANCE]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board!.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.makeMove({ x, y, value });
		})
	}),
	[HINT_TYPE.ELIMINATION]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board!.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.makeMove({ x, y, value });
		})
	}),
	[HINT_TYPE.ELIM_DUPE]: createHintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board!.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.makeMove({ x, y, value });
		})
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
const createTriplesHint = ({ targets, origin, type }: TriplesTechniqueResult) => {
	const originCoords = origin.map(({ x, y }) => `(${x},${y})`).join(' / ');
	const message = `There is a ${type} somewhere on the board: ${originCoords}`;
	const subType = type;

	const hint = new Hint(
		HINT_TYPE.TRIPLES,
		message,
		targets,
		[...origin],
		{ subType }
	);
	const hintValidator: HintValidatorFn = ({ board, solution }) => {
		// check for mistakes first
		if (board.hasIncorrectValues(solution)) return false;
		for (const { x, y } of targets) {
			if (board.get(x, y) !== EMPTY) return false;
		}
		// both source cells should have the same value
		const sourceCells = origin.map(cell => board.get(cell.x, cell.y));
		if (sourceCells[0] !== sourceCells[1] || sourceCells[0] === EMPTY) {
			return false;
		}
		return true;
	}
	hint.setValidator(hintValidator);
	console.log({ type: 'triples', hint });
	return hint;
}
const createBalanceHint = ({ targets, origin }: BalanceTechniqueResult) => {
	const lineId = origin[0];
	const lineName = lineTypeFromLineId(lineId);
	const message = `A ${lineName} can be balanced (${lineName}: ${lineId})`;
	const hint = new Hint(
		HINT_TYPE.BALANCE,
		message,
		targets,
		origin
	);
	console.log({ type: 'balance', hint });
	return hint;
}
const createEliminationHint = ({ targets, source, elimType }: ElimTechniqueResult) => {
	const lineId = source[0];
	const lineName = lineTypeFromLineId(lineId);
	const message = `Values can be eliminated from this ${lineName} (${lineId}).`;
	const subType = elimType;
	const hint = new Hint(
		HINT_TYPE.ELIMINATION,
		message,
		targets,
		source,
		{ subType }
	);
	console.log({ type: 'elim', hint })
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
	[HINT_TYPE.TRIPLES]: createTriplesHint,
	[HINT_TYPE.BALANCE]: createBalanceHint,
	[HINT_TYPE.ELIMINATION]: createEliminationHint,
	[HINT_TYPE.ELIM_DUPE]: createElimDupeHint
}

function titleCase<Str extends string>(str: Str): Capitalize<Str> {
	return str[0].toUpperCase() + str.slice(1) as Capitalize<Str>;
}