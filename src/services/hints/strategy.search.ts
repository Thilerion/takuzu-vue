import type { SimpleBoard } from "@/lib/board/Board.js";
import type { SteppedHint } from "./SteppedHint/types.js";
import { TriplesSteppedHint } from "./SteppedHint/TriplesHint.js";
import { BalanceSteppedHint } from "./SteppedHint/BalanceHint.js";
import { GenericDuplicateLineSteppedHint } from "./SteppedHint/GenericDuplicateLineHint.js";
import { GenericEliminationSteppedHint } from "./SteppedHint/GenericEliminationHint.js";
import { humanTriplesTechnique } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import { humanBalanceTechnique } from "@/lib/solvers/human-solver/techniques/BalanceTechnique.js";
import { genericDuplicateLineTechnique } from "@/lib/solvers/human-solver/techniques/GenericDuplicateLineTechnique.js";
import { genericEliminationTechnique, type GenericEliminationTechniqueResult } from "@/lib/solvers/human-solver/techniques/GenericEliminationTechnique.js";

export function findHintWithHumanTechniques(board: SimpleBoard): SteppedHint | null {
	return findTriplesHint(board)
		?? findBalanceHint(board)
		// TODO: generic elimination and duplicate line hints can throw "UnsolvableBoardLineError" if the board is invalid. They should be handled somewhere at least.
		?? findGenericEliminationHint(board)
		?? findGenericDuplicateLineHint(board)
		?? null;
}

function findTriplesHint(board: SimpleBoard): TriplesSteppedHint | null {
	const techniqueResult = humanTriplesTechnique({ board });
	if (!techniqueResult.length) return null;
	
	// Sort Triples technique results based on usefulness: prefer more targets, else prefer double over sandwich
	techniqueResult.sort((a, b) => {
		if (a.targets.length !== b.targets.length) return b.targets.length - a.targets.length;
		return a.type === 'double' ? -1 : 1;
	});
	return new TriplesSteppedHint(techniqueResult[0]);
}
function findBalanceHint(board: SimpleBoard): BalanceSteppedHint | null {
	const techniqueResult = humanBalanceTechnique({ board });
	if (!techniqueResult.length) return null;
	
	// TODO: sort balance hints based on usefulness or how easy they would be to find
	return new BalanceSteppedHint(techniqueResult[0]);
}
function findGenericEliminationHint(board: SimpleBoard): GenericEliminationSteppedHint | null {
	const techniqueResult = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 16 });
	if (!techniqueResult.length) return null;

	// Sort Generic Elimination technique results: the easiest ones (with lowest "leastRemaining") are preferred, then sort by most targets, then by lowest "mostRemaining"
	techniqueResult.sort((a, b) => orderByRemainingAndTargets(a, b));

	return new GenericEliminationSteppedHint(techniqueResult[0]);
}
function findGenericDuplicateLineHint(board: SimpleBoard): GenericDuplicateLineSteppedHint | null {
	const techniqueResult = genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 16 });
	if (!techniqueResult.length) return null;
	
	// Sort Generic DuplicateLine technique results: the easiest ones (with lowest "leastRemaining") are preferred, then sort by most targets, then by lowest "mostRemaining"
	techniqueResult.sort((a, b) => orderByRemainingAndTargets(a, b));

	return new GenericDuplicateLineSteppedHint(techniqueResult[0]);
}

function orderByRemainingAndTargets(a: Pick<GenericEliminationTechniqueResult, 'remainingCounts' | 'targets'>, b: Pick<GenericEliminationTechniqueResult, 'remainingCounts' | 'targets'>) {
	const [leastRemainingA, mostRemainingA] = a.remainingCounts;
	const [leastRemainingB, mostRemainingB] = b.remainingCounts;
	if (leastRemainingA !== leastRemainingB) return leastRemainingA - leastRemainingB;
	if (a.targets.length !== b.targets.length) return b.targets.length - a.targets.length;
	return mostRemainingA - mostRemainingB;
}