import { EMPTY } from "@/lib/constants";
import { lineTypeFromLineId } from "@/lib/utils";
import { usePuzzleStore } from "../puzzle";

export const HINT_TYPE = {
	MISTAKE: 'MISTAKE',
	TRIPLES: 'TRIPLES',
	BALANCE: 'BALANCE',
	ELIMINATION: 'ELIMINATION',
	ELIM_DUPE: 'ELIM_DUPE'
};

export const HINT_TITLE = {
	MISTAKE: 'Mistake',
	TRIPLES: 'Max consecutive',
	BALANCE: 'Line balance',
	ELIMINATION: 'Elimination',
	ELIM_DUPE: 'Unique lines'
}

let lastHintId = -1;
export class Hint {
	constructor(type, message, targets, source = [], context = {}) {
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

	get isLegacyHint() {
		return true;
	}

	setValidator(fn) {
		this.validator = fn;
		return this;
	}
}

const HintAction = (label, fn) => ({ label, fn });
const hintActions = {
	[HINT_TYPE.MISTAKE]: HintAction('Fix', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		targets.forEach(target => {
			const { x, y } = target;
			puzzleStore.toggle({ x, y, value: EMPTY });
		})
	}),
	[HINT_TYPE.TRIPLES]: HintAction('Execute', (hint) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		hint.targets.forEach(({ x, y, value }) => {
			const boardValue = board.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.toggle({ x, y, value });
		})
	}),
	[HINT_TYPE.BALANCE]: HintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.toggle({ x, y, value });
		})
	}),
	[HINT_TYPE.ELIMINATION]: HintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.toggle({ x, y, value });
		})
	}),
	[HINT_TYPE.ELIM_DUPE]: HintAction('Execute', ({ targets }) => {
		const puzzleStore = usePuzzleStore();
		const board = puzzleStore.board;
		targets.forEach(({ x, y, value }) => {
			const boardValue = board.get(x, y);
			if (boardValue !== EMPTY) return;
			puzzleStore.toggle({ x, y, value });
		})
	})
}

const createMistakeHint = (cells) => {
	const message = cells.length > 1 ?
		"It seems you've made some mistakes." :
		"It seems you've made a mistake.";
	const targets = [...cells];
	const hint = new Hint(
		HINT_TYPE.MISTAKE,
		message,
		targets,
	);
	const hintValidator = ({ board, solution }) => {
		for (const { x, y } of targets) {
			const boardValue = board.get(x, y);
			const solutionValue = solution.get(x, y);
			if (boardValue !== solutionValue && boardValue !== EMPTY) return true;
		}
		return false;
	}
	return hint.setValidator(hintValidator);
}
const createTriplesHint = ({ targets, origin, type }) => {
	const originCoords = origin.map(({ x, y }) => `(${x},${y})`).join(' / ');
	const message = `There is a ${type} somewhere on the board: ${originCoords}`;
	const subType = type;

	const hint = new Hint(
		HINT_TYPE.TRIPLES,
		message,
		targets,
		origin,
		{ subType }
	);
	const hintValidator = ({ board, solution }) => {
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
	return hint.setValidator(hintValidator);
}
const createBalanceHint = ({ targets, origin }) => {
	const lineId = origin[0];
	const lineName = lineTypeFromLineId(lineId);
	const message = `A ${lineName} can be balanced (${lineName}: ${lineId})`;
	return new Hint(
		HINT_TYPE.BALANCE,
		message,
		targets,
		origin
	);
}
const createEliminationHint = ({ targets, source, elimType }) => {
	const lineId = source[0];
	const lineName = lineTypeFromLineId(lineId);
	const message = `Values can be eliminated from this ${lineName} (${lineId}).`;
	const subType = elimType;
	return new Hint(
		HINT_TYPE.ELIMINATION,
		message,
		targets,
		source,
		{ subType }
	);
}
const createElimDupeHint = ({ targets, source, elimType, targetLine }) => {
	const lineId = targetLine;
	const lineName = lineTypeFromLineId(lineId);
	const sourceLines = source.join(',');
	const message = `${titleCase(lineName)} ${lineId} has potential duplicate ${lineName}s: "${sourceLines}". Values can be eliminated from this ${lineName}.`;
	const subType = elimType;
	return new Hint(
		HINT_TYPE.ELIM_DUPE,
		message,
		targets,
		source,
		{ subType, targetLine }
	);
}

export const hintGenerators = {
	[HINT_TYPE.MISTAKE]: createMistakeHint,
	[HINT_TYPE.TRIPLES]: createTriplesHint,
	[HINT_TYPE.BALANCE]: createBalanceHint,
	[HINT_TYPE.ELIMINATION]: createEliminationHint,
	[HINT_TYPE.ELIM_DUPE]: createElimDupeHint
}

function titleCase(str) {
	return str[0].toUpperCase() + str.slice(1);
}