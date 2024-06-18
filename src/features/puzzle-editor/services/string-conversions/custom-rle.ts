import { EMPTY } from "@/lib/constants.js";
import type { BoardShape, BoardString, Brand, PuzzleValueLineStr } from "@/lib/types.js";
import { isValidBoardString } from "@/lib/utils/puzzle-line.utils.js";

export type CustomPuzzleStringRleWithDims = Brand<string, "ff/1a8j">;

export function toCustomPuzzleStringRleWithDims(
	boardStr: PuzzleValueLineStr | BoardString,
	dimensions: BoardShape
): CustomPuzzleStringRleWithDims {
	if (!isValidBoardString(boardStr)) {
		throw new Error('Invalid board string');
	}
	// conversions: 0 => 1, 00 => 2, 000 => 3, 0000 => 4; 1 => 5, 11 => 6, 111 => 7, 1111 => 8
	// conversions of empty cells: single => a, two => b, three => c, etc.
	const encoded: string[] = [];
	const length = boardStr.length;
	for (let i = 0; i < length; i++) {
		const sliceOf4 = boardStr.slice(i, i + 4);
        if (sliceOf4.startsWith('0')) {
			if (sliceOf4 === '0000') {
				encoded.push('4');
				i += 3;
			} else if (sliceOf4.startsWith('000')) {
				encoded.push('3');
				i += 2;
			} else if (sliceOf4.startsWith('00')) {
				encoded.push('2');
				i += 1;
			} else {
				encoded.push('1');
			}
        } else if (sliceOf4.startsWith('1')) {
			if (sliceOf4 === '1111') {
				encoded.push('8');
				i += 3;
			} else if (sliceOf4.startsWith('111')) {
				encoded.push('7');
				i += 2;
			} else if (sliceOf4.startsWith('11')) {
				encoded.push('6');
				i += 1;
			} else {
				encoded.push('5');
			}
        } else if (boardStr[i] === '.') {
			// Check if the rest of the sequence is empty
			// If so, the run length can be easily calculated. If "excludeEmptyEnd" is true, we can stop here and return the encoded string
			const rest = boardStr.slice(i);
			if (!rest.includes('1') && !rest.includes('0')) {
				encoded.push(encodeEmptyRunLength(rest.length));
				break;
			}
            let runLength = 1;
			for (let j = 1; i + j < length; j++) {
				if (boardStr[i + j] === '.') {
					runLength++;
				} else {
					break;
				}
			}
            encoded.push(encodeEmptyRunLength(runLength));
            i += runLength - 1;
        }
    }
	const encodedBoard = encoded.join('');
	return `${encodeBoardDimensions(dimensions)}/${encodedBoard}` as CustomPuzzleStringRleWithDims;
}

export function isPotentialCustomPuzzleStringRleWithDims(encodedString: string): encodedString is CustomPuzzleStringRleWithDims {
	// Test that encoded string only contains valid characters: 1-8, a-z
	return /^[a-z]{1,2}\/([1-8a-z])+$/.test(encodedString);
}


const CODE_A = "a".charCodeAt(0);
const CODE_Z = "z".charCodeAt(0);
const A_Z_RANGE = CODE_Z - CODE_A + 1;

// Converts a number to a (single) character: 1 => "a", 2 => "b", ..., 26 => "z"
export function numToChar(num: number): string {
	if (num <= 0 || num > A_Z_RANGE) {
		throw new Error(`Invalid number: ${num}`);
	}
	return String.fromCharCode(num + CODE_A - 1);
}
// Converts a character in range [a-z] to a number: a => 1, b => 2, ..., z => 26
export function charToNum(char: string): number {
	if (char.length !== 1) {
		throw new Error(`Invalid character: ${char}`);
	}
	const code = char.charCodeAt(0);
	if (code < CODE_A || code > CODE_Z) {
		throw new Error(`Invalid character: ${char}`);
	}
	return code - CODE_A + 1;
}

export const encodeEmptyRunLength = (runLength: number): string => {
	if (runLength < 1) {
		return '';
	}
	if (CODE_A + runLength - 1 > CODE_Z) {
		// Would exceed "z" character
		let res = '';
		while (runLength >= A_Z_RANGE) {
			res += 'z';
			runLength -= A_Z_RANGE;
		}
		if (runLength > 0) {
			res += numToChar(runLength);
		}
		return res;
	} else {
		return numToChar(runLength);
	}
}

const encodeBoardDimensions = ({ width, height }: BoardShape) => {
	if (width === height) {
		return numToChar(width);
	} else {
		return `${numToChar(width)}${numToChar(height)}`;
	}
}
const decodeBoardDimensions = (dimensionsStr: string): BoardShape => {
	if (dimensionsStr.length === 1) {
		const n = charToNum(dimensionsStr);
		return { width: n, height: n };
	} else {
		const [widthStr, heightStr] = dimensionsStr.split('');
		const width = charToNum(widthStr);
		const height = charToNum(heightStr);
		return { width, height };
	}
}

/**
 * Decodes a "CustomPuzzleStringRLE" back to a BoardString.
 * @param encodedString The encoded string to decode
 */
export function decodeCustomPuzzleStringRleWithDims(
	encodedString: string,
): { board: BoardString, dimensions: BoardShape } {
	const [dimensionsStr, encodedBoard] = encodedString.split('/');
	const dimensions = decodeBoardDimensions(dimensionsStr);
	return {
		board: decodeCustomPuzzleStringRleBoard(encodedBoard, dimensions.width * dimensions.height),
		dimensions
	};
}

function decodeCustomPuzzleStringRleBoard(
	encodedString: string,
	boardStringLength: number,
): BoardString {
    // Decode in reverse order of the encoding process
    const encodedArr = encodedString.split('');
	const decodedArr = encodedArr.map((char): PuzzleValueLineStr => {
		if (char >= 'a' && char <= 'z') {
            return EMPTY.repeat(charToNum(char));
        }
		switch (char) {
            case '8': return '1111';
            case '7': return '111';
            case '6': return '11';
            case '5': return '1';
            case '4': return '0000';
            case '3': return '000';
            case '2': return '00';
            case '1': return '0';
            default: {
				throw new Error(`Invalid character in RLE string: ${char}`);
			}
        }
	})
	let decodedStr = decodedArr.join('');
	if (boardStringLength != null) {
		if (decodedStr.length < boardStringLength) {
			decodedStr += EMPTY.repeat(boardStringLength - decodedStr.length);
		} else if (decodedStr.length > boardStringLength) {
			throw new Error('Decoded string is longer than the provided board length');
		}
	}
	if (boardStringLength != null && decodedStr.length < boardStringLength) {
		decodedStr += EMPTY.repeat(boardStringLength - decodedStr.length);
	}
	return decodedStr as BoardString;
}