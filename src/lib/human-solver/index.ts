import type { BalanceTechniqueResult } from './balance';
import type { DuplicateLineTechniqueResult } from './duplicate';
import type { ElimTechniqueResult } from './elimination';
import type { TriplesTechniqueResult } from './triples';

export { humanSolveTriples, type TriplesTechniqueResult } from './triples';
export { humanSolveBalance, type BalanceTechniqueResult } from './balance';
export { humanSolveElimination, type ElimTechniqueResult } from './elimination';
export { humanSolveDuplicateLine, type DuplicateLineTechniqueResult } from './duplicate';

export type TechniqueResult = TriplesTechniqueResult | BalanceTechniqueResult | ElimTechniqueResult | DuplicateLineTechniqueResult;