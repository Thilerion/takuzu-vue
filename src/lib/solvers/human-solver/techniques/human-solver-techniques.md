# Human Solver Techniques

This module contains different techniques that can solve a puzzle, emulating the ways a human player might use.

There are (currently) four distinct "base" techniques:

1. Triples Technique
2. Line Balance Technique
	a. This might be split later into a) SingleRemainingBalanceTechnique and b) GenericLineBalanceTechnique
3. Elimination Technique
	a. GenericEliminationTechnique
	b. SingleSymbolEliminationTechnique (try to place the symbol that has a countRemaining of 1)
	c. RemainingCountPatternReduction; used to reduce the remainingCounts so SingleSymbolElimination can potentially be used to actually fill in cells
4. Duplicate Line Elimination
	a. Similar to Elimination Technique, but uses the current filled lines in the board to eliminate possibilities.
	b. Should be setup in such a way that it can only find results that are the result of using the filledLines (otherwise it might be the same as the Elimination techniques)
	c. Subtechniques might be: GenericDuplicateLineElimination, SingleRemainingDuplicateLineElimination (with 1x 1 and 1x 0 remaining to be placed), SingleSymbolDuplicateLineElimination (with 1x symbol A, and 2+x time symbol B), and the same RemainingCountPatternReduction