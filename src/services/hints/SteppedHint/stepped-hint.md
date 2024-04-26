# Stepped hints

## Max consecutive

### Pairs
1. There is a pair somewhere on the board. *(Remember: only two of the same symbol can be next to each other.)*
	1. **Action**: Locate => highlight(two adjacent cells)
2. Three of the same [symbol/color] are not allowed next to each other.
	1. **Action**: Locate => highlight the target cell(s)
3. Two [red/blue tiles/0s/1s/Os/Xs] are next to each other. That means the surrounding cell[s?] must be [opposite symbol].
	1. **Action**: apply and finish

### Sandwich
1. There is a sandwich somewhere on the board. *(Remember: only two of the same symbol can be next to each other.)*
	1. **Action**: Locate => highlight (two adjacent cells)
2. Three of the same [symbol/color] are not allowed next to each other.
	1. **Action**: Locate => highlight the middle cell
3. An empty cell is surrounded by two [red tiles/0s]. The cell inbetween must therefore be [blue/a 1].
	1. **Action**: apply and finish

## Max consecutive - variations
### Many possible MaxConsecutive hints possible
Replace initial message with:
- "There are multiple [pairs and sandwiches/pairs/sandwiches] on the board. *(Remember: only two of the same symbol can be next to each other.)*"

## Line Balance/Line Counts
### Square/rect board
1. There is a [row/column] on the board that can be balanced. *(Remember: every [row/column] has an equal amount of each [color/symbol])*
	1. **Action**: Locate => highlight line
2. This [row/column] requires an equal amount of each [symbol/color], and all [red tiles/1s] have been placed.
	1. **Action**: Next => additionally highlight cells that can be filled.
3. This [row/column] currently has the required [4/5/6] [red tiles/0s], and only [1/2/3] [blue tiles/1s]. The empty cells must all be [blue tiles/1s].
	1. **Action**: Apply and finish

### Odd-sized board
1. There is a [row/column] on the board that can be balanced. *(Remember: every [row/column] on an odd-sized board requires 4 [blue tiles/0s] and an extra [red tile/1], in this case 5.*
	1. **Action**: Locate => highlight line
2. This [row/column] requires [4] [blue tiles/0s], which have all been placed, and [4+1] [red tiles/1s], of which only [3] have been placed.
	1. **Action**: Next => additionally highlight cells that can be filled
3. [All marked cells/The marked cell] must be [[a]red tile[s]/0[s]], because all of the required [blue tiles/0s] have already been placed.
	1. **Action**: Apply and finish

### Variation: many line balance hints available
- (replacement text; multiple rows or multiple columns): There are [2/3/multiple] [rows/columns] that can be balanced.
- (replacement text; one row and one column): There is a row and a column that can be balanced.
- (replacement text; 1+ row and 1+ column, total 3+): There are multiple rows and columns that can be balanced.

### Variation: line only has a single empty tile
- (replacement text): There is a [row/column] that only has one empty cell left. *(Remember: every [row/column] has an equal amount of each [color/symbol])*
- (replacement text step 2): Each [row/column] requires an equal amount of [red/blue tiles/0s and 1s] - in this case [4/5/6]. The last [tile/symbol] to place can be deduced by counting each [tile/symbol] in the line.

### Variation (optional): rectangular boards
- Possible to add a message indicating that rows require X red/blue tiles, and columns require Y red/blue tiles.

## Elimination: single placement
### Default Single placement elimination (try to place)
```
Example:
....101.011011
[REQ]: 7/7, [COUNT]: 3/6, [REM]: 4/1
Result:
0..01010011011
```
1. There is a [row/column] where certain [symbol[s]/tile[s]] can be deduced by eliminating impossible [symbols/tiles].
	*Or: There is a [row/column] where only one of a certain [color/symbol] must still be placed (and more of [opposite color/symbol]), but certain possibilities can be eliminated.*
	1. **Action**: Locate => highlight line
2. This [row/column] requires [4] [0s], but only one of 1. By trying to place the single 1, and visualizing that the rest of the empty cells are 0s, certain placements of the 1 can be eliminated. (this explanation sucks...)
	1. **Action**: Locate => highlight one(!) place where the 1 can not be placed
3. If we try to place a 1 at the marked cell, the rest of the cells must be a 0. However, that would mean there are [3/4+] 0s in a row, which is not allowed.
	1. **Action**: next => fill this single cell with the correct value, keep it highlighted, and highlight all other empty cells.
4. Similarly, for each of these cells, try to visualize if placing a 1 there would render the line invalid.
	1. **Action**: next => remove highlights for each cell where both a 1 and a 0 can be placed.
5. For each of these cells, placing a 1 there would make the line invalid. Therefore, they must all be 0s.
	1. **Action**: apply and finish

### Elimination: single placement with group exclusion
```
Example:
..01101.
[REQ]: 4/4, [COUNT]: 2/3, [REM]: 2/1
Result:
..011010
```

1. Same as before
	1. Action: Locate => highlight line
2. Certain possibilities for this [row/column] for the last remaining [red tile/1] can be eliminated.
	1. Action: Next => highlight the group that can be used for elimination 
3. The marked cells, as a group, require exactly one of each [symbol/color], but the order is not known. That means that the amount of [red tiles] for the other cells is [0] and the amount of [blue tiles] for the other cells is [1].












