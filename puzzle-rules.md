# Rules

Each puzzle consists of a grid, initially filled with a small amount of 0s and 1s.

The goal of the puzzle is to fill the grid with 0s and 1s. Each puzzle is unique and has only a single solution that can be found by placing 0s and 1s according to the following rules:

1. **Each cell is filled with either a 0 or a 1**
2. **Maximum of two consecutive digits**

	A digit may not appear more than twice below or next to each other.
	
3. **Equal amount of digits per line**

	Every row, and every column, must contain an equal amount of 0s and 1s.
	
	For instance, in a 8x8 puzzle, every row and column must contain 4 0s and 4 1s.
	
	In a rectangular puzzle that is 6 cells wide and 10 cells tall, each row contains 3x 0s and 1s, and each column contains 5x 0s and 1s.

4. **Each row, and each column is unique**

	There can be no duplicate rows, and there can be no duplicate columns.<br>
	*(A sequence of digits can, however, appear in both one row and one column)*

# Tips
## Basic techniques

1. **Find pairs**

	Because there can only be a maximum of two equal symbols next to each other, a pair of one symbol can always be surrounded by the other symbol:

	x11x => 0110<br>
	00xx1011xx => 001x10110x
2. **Find sandwiches**

	Another common pattern is two of the same digit separated by an empty cell. The center cell must be the opposite symbol, because otherwise there would be three consecutive digits (which, again, is not allowed).

	x1x1x => x101x<br>
	0x110x0 => 0x11010

3. **Balance rows and columns**

	Each row and column should contain an equal amount of 0s and 1s. Therefore, if a line has reached required amount of a certain symbol, the rest of the cells must be the other symbol:

	10110x => 101100<br>
	01x0xx010x => 0100110101

## Intermediate techniques
1. **Eliminate impossible combinations**

	*TODO: rephrase. If a line requires only a single 1 or a single 0, try placing it and filling the line with the other symbol. If the line is incorrect, the single symbol you placed must be the other symbol.*

2. **Avoid duplicate rows and columns**

	No two rows may be the same, and no two columns may be the same. Therefore, if a line is missing only a few symbols and all its symbols are the same as in a completed line, the remaining values can be deduced:

	*TODO: example here of a grid with some completed lines, and a line that only requires 1x0 and 1x1*

	*NOTE: This is only sometimes needed for very small puzzles (6x6 on difficulty 2+) and on very hard puzzles (difficulty 4 or 5).*

## Advanced techniques
1. **Eliminate impossible combinations by recognizing patterns**

	*TODO: rephrase. There are some patterns that can be used to eliminate some combinations like 1..0 and 0...0. Use these to eliminate how many of a specific digit is required in the rest of the line.*

2. **Avoid duplicate rows and columns with impossible combinations**

	*TODO: rephrase. Duplicate rows and columns can also occur with more than 1x0 and 1x1 remaining. Sometimes elimination is needed for this (in very hard puzzles).*

# Puzzle variations
## Odd Binary Puzzles
Odd binary puzzles are always square, and have an odd amount of rows and columns such as 7x7 and 9x9.

All standard rules apply, however each row and each column requires one additional 1 to be placed in it. That means, for a 7x7 puzzle, each line has 3x 0s, and 4x 1s.