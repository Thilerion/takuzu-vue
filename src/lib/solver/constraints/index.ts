import applyTriplesConstraint from "./Triples.js";
import applyLineBalanceConstraint from "./LineBalance.js";
import applyEliminationConstraint from "./Elimination.js";

export type ConstraintFn = typeof applyTriplesConstraint | typeof applyLineBalanceConstraint | typeof applyEliminationConstraint;

export { applyEliminationConstraint, applyTriplesConstraint, applyLineBalanceConstraint };