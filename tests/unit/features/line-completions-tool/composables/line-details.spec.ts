import { usePuzzleLineDetails } from "@/features/line-completions-tool/composables/line-details.js";
import { BoardLine } from "../../../../../src/lib/board/BoardLine.js";
import { nextTick, ref } from "vue";
import type { PuzzleValueLineStr } from "@/lib/types.js";
import { EMPTY, ONE, ZERO } from "@/lib/constants.js";

// Mock the BoardLine class
vi.mock('../../../../../src/lib/board/BoardLine.js', () => ({
	BoardLine: {
		fromValues: vi.fn()
	}
}))

describe('usePuzzleLineDetails', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	})

	it('should initialize with null values', () => {
		const line = ref<PuzzleValueLineStr | null>(null)
		const { required, counts, remaining, length, lineArr } = usePuzzleLineDetails(line)

		expect(required.value).toBeNull()
		expect(counts.value).toBeNull()
		expect(remaining.value).toBeNull()
		expect(length.value).toBeNull()
		expect(lineArr.value).toEqual([])
	})

	it('should update values when line is set', () => {
		const lineStr: PuzzleValueLineStr = '.10..0';
		const line = ref(lineStr);
		const mockBoardLine: Pick<BoardLine, 'numRequired' | 'counts' | 'countRemaining' | 'length'> = {
			numRequired: { [ONE]: 3, [ZERO]: 3 },
			counts: { [ONE]: 1, [ZERO]: 2, [EMPTY]: 3 },
			countRemaining: { [ONE]: 2, [ZERO]: 1 },
			length: 6
		}
		vi.mocked(BoardLine.fromValues).mockReturnValue(JSON.parse(JSON.stringify(mockBoardLine)) as any)

		const { required, counts, remaining, length, lineArr } = usePuzzleLineDetails(line)

		expect(required.value).toEqual(mockBoardLine.numRequired)
		expect(counts.value).toEqual(mockBoardLine.counts)
		expect(remaining.value).toEqual(mockBoardLine.countRemaining)
		expect(length.value).toBe(mockBoardLine.length)
		expect(lineArr.value).toEqual(lineStr.split(''))
	})

	it('should reset values when line becomes null', async () => {
		expect.assertions(10);
		const line = ref<null | PuzzleValueLineStr>('1.0.1.0');
		
		const { required, counts, remaining, length, lineArr } = usePuzzleLineDetails(line);

		expect(required.value).not.toBeNull()
		expect(counts.value).not.toBeNull()
		expect(remaining.value).not.toBeNull()
		expect(length.value).not.toBeNull()
		expect(lineArr.value).not.toEqual([])

		// Change line to null
		line.value = null;

		await nextTick();

		expect(required.value).toBeNull()
		expect(counts.value).toBeNull()
		expect(remaining.value).toBeNull()
		expect(length.value).toBeNull()
		expect(lineArr.value).toEqual([]);
	})

	it('should update values when line changes', async () => {
		expect.assertions(7);
		
		const line = ref<null | PuzzleValueLineStr>('1.0.1.0');
		
		// First check that BoardLine.fromValues is called with the line
		// Then, the line is set to a new value, and we check that BoardLine.fromValues is called again
		
		const { required, counts, remaining, length } = usePuzzleLineDetails(line);

		expect(BoardLine.fromValues).toHaveBeenCalledOnce();

		line.value = '110.1.0';

		await nextTick();

		expect(BoardLine.fromValues).toHaveBeenCalledTimes(2);
		expect(BoardLine.fromValues).toHaveBeenLastCalledWith('110.1.0'.split(''), expect.any(String));

		const fromValuesMock = vi.mocked(BoardLine.fromValues).mock;
		const lastReturnValue = fromValuesMock.results.at(-1)!.value as BoardLine;

		expect(required.value).toEqual(lastReturnValue.numRequired);
		expect(counts.value).toEqual(lastReturnValue.counts);
		expect(remaining.value).toEqual(lastReturnValue.countRemaining);
		expect(length.value).toBe(lastReturnValue.length);
	})
})