import applyTriplesConstraint from "./constraints/Triples";

import { selectCell, selectValue } from "./selection";

export default class Solver {
	constructor(initialBoard, conf = {}) {
		this.initialBoard = initialBoard;

		this.maxSolutions = conf.maxSolutions ?? 1;

		// timeout options
		this.timeoutDuration = conf.timeoutDuration ?? 2000;
		this.throwAfterTimeout = conf.throwAfterTimeout ?? false;

		// search / backtracking options
		this.disableBacktracking = conf.disableBacktracking ?? false;
		this.selectCell = conf.selectCell ?? selectCell.fewest_empty_peers;
		this.selectValue = conf.selectValue ?? selectValue.least_constraining;

		// constraints to apply while solving
		this.constraintFns = conf.constraintFns ?? [
			applyTriplesConstraint
		]

		// current solver state
		this.solutions = [];
		this.solving = false;
		this.finished = false;

		// TODO: final board if solving not successful?
	}
}