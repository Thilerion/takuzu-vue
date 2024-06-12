import { EMPTY } from "@/lib/constants.js";
import type { BoardString, PuzzleValueLineStr } from "@/lib/types.js";
import { isValidBoardString } from "@/lib/utils/puzzle-line.utils.js";

/** Converts a BoardString to a "CustomPuzzleStringRLE", which is a condensed version of a BoardString. */
export function toCustomPuzzleStringRLE(
	boardStr: BoardString | PuzzleValueLineStr,
	excludeEmptyEnd = false
) {
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
				if (excludeEmptyEnd) {
					return encoded.join('');
				} else {
					encoded.push(encodeEmptyRunLength(rest.length));
					break;
				}
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
	return encoded.join('');
}

const codeA = 'a'.charCodeAt(0);
const codeZ = 'z'.charCodeAt(0);
const codeAZRange = codeZ - codeA + 1;
const encodeEmptyRunLength = (runLength: number): string => {
	if (runLength < 1) {
		return '';
	}
	if (codeA + runLength - 1 > codeZ) {
		// Would exceed "z" character
		let res = '';
		while (runLength >= codeAZRange) {
			res += 'z';
			runLength -= codeAZRange;
		}
		if (runLength > 0) {
			res += String.fromCharCode(codeA + runLength - 1);
		}
		return res;
	} else {
		return String.fromCharCode(codeA + runLength - 1);
	}
}

/**
 * Decodes a "CustomPuzzleStringRLE" back to a BoardString.
 * @param encodedString The encoded string to decode
 * @param boardStringLength The length of the board string. Used to pad the end with empty cells if required
 */
export function decodeCustomPuzzleStringRLE(
	encodedString: string,
	boardStringLength?: number,
): BoardString {
    // Decode in reverse order of the encoding process
    const encodedArr = encodedString.split('');
	const decodedArr = encodedArr.map((char): PuzzleValueLineStr => {
		if (char >= 'a' && char <= 'z') {
            return EMPTY.repeat(char.charCodeAt(0) - codeA + 1);
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