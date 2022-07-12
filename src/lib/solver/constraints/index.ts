import applyTriplesConstraint from "./Triples";
import applyLineBalanceConstraint from "./LineBalance";
import applyEliminationConstraint from "./Elimination";

export type ConstraintFn = typeof applyTriplesConstraint | typeof applyLineBalanceConstraint | typeof applyEliminationConstraint;

export { applyEliminationConstraint, applyTriplesConstraint, applyLineBalanceConstraint };