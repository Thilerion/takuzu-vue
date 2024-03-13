# Human Solver Techniques

This module contains different techniques that can solve a puzzle, emulating the ways a human player might use.

## Base techniques
There are (currently) four distinct "base" techniques:

1. Triples Technique
2. Line Balance Technique
	* This might be split later into:	
		1) **SingleRemainingBalanceTechnique**, and
		2) **GenericLineBalanceTechnique**
3. Elimination Technique
	1. **GenericEliminationTechnique**
	2. **SingleSymbolEliminationTechnique** (try to place the symbol that has a countRemaining of 1)
	3. **RemainingCountPatternReduction**; used to reduce the remainingCounts so SingleSymbolElimination can potentially be used to actually fill in cells
4. Duplicate Line Elimination
	* Similar to Elimination Technique, but uses the current filled lines in the board to eliminate possibilities.
	* Should be setup in such a way that it can only find results that are the result of using the filledLines (otherwise it might be the same as the Elimination techniques)
	* Subtechniques might be:
		1. GenericDuplicateLineElimination
		2. SingleRemainingDuplicateLineElimination (with 1x 1 and 1x 0 remaining to be placed)
		3. SingleSymbolDuplicateLineElimination (with 1x symbol A, and 2+x time symbol B)
		4. The same RemainingCountPatternReduction

## Elimination technique
### Examples
#### Least remaining = 1
| Line       | Size | Remaining | Result     |
|------------|-----:|-----------|------------|
| .1..1..011 |   10 | 1-4       | 01001..011 |
| ...0110011 |   10 | 1-2       | 0..0110011 |
| 1.0..1...1 |   10 | 2-4       | 100101...1 |

### Pattern types
*An opening square bracket indicates the start of the line, and a closing square bracket indicates the end of the line.*

| Pattern      | Possibilities              | -rem 0 | -rem 1 |
|--------------|----------------------------|--------|--------|
| 0xx1         | 0101, 0011                 | 1      | 1      |
| [xx1, 1xx]   | [011, [101, [001           | 1-2    | 0      |
| [xx0, 0xx]   | [010, [100, [110           | 0      | 1-2    |
| 0xxx0        | 00110, 01010, 01100, 00100 | 1+     | 1+     |
| 1xxx1        | 11011, 11001, 10101, 10011 | 1+     | 1+     |
| 1x0x1        |                            |        |        |
| 0x1x0        |                            |        |        |
| [xxx1, 1xxx] |                            |        |        |
| [xxx0, 0xxx] |                            |        |        |
| [xxx0, 0xxx] |                            |        |        |
| 0xxxx1       |                            |        |        |
| 0xxxx0       |                            |        |        |
| 1xxxx1       |                            |        |        |
| xxx          |                            | 1+     | 1+     |
| xxxx         |                            | 1+     | 1+     |
| xxxxx        |                            | 1+     | 1+     |
| xxxxxx       |                            | 2+     | 2+     |
|              |                            |        |        |