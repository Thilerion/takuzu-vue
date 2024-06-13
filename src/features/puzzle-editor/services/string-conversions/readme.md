## Representations of a puzzle board from "lib":
* PuzzleGrid: 2D array of PuzzleValue (0, 1, .)
* BoardString: flattened string of PuzzleGrid (0..1..010.1...)
* BoardExportString: dimensions + BoardString (4x4;..1.010..1.001..)

## Representations of a puzzle board specifically for the custom puzzle creator:
* customPuzzleStringLong: flattened string of PuzzleGrid, with each row separated by a space (0..1 ..10 .... .101)
* customPuzzleStringRLE: condensed version, where sequences are shortened based on a modified RLE