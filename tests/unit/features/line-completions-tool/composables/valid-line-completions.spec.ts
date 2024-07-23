import { useValidLineCompletions } from "@/features/line-completions-tool/composables/valid-line-completions.js";
import * as lineGenMemoized from "../../../../../src/lib/line-generation/memoized.js";
import type { PuzzleValueLineStr } from "@/lib/types.js";
import { ref } from "vue";

describe('useValidLineCompletions', () => {
	let getValidLineCompletionsSpy: any;

	beforeEach(() => {
		// Create a spy on getValidLineCompletions
		getValidLineCompletionsSpy = vi.spyOn(lineGenMemoized, 'getValidLineCompletions');
	})
	afterEach(() => {
		// Clear the spy after each test
		vi.restoreAllMocks();
	})

	it('should initialize with null values when input is null', () => {
		const input = ref<PuzzleValueLineStr | null>(null)
		const { completions, resultingLine } = useValidLineCompletions(input)

		expect(completions.value).toBeNull()
		expect(resultingLine.value).toBeNull()
	})

	it('should handle input with only one completion', () => {
		const input = ref<PuzzleValueLineStr | null>('1.0.1.0')
		getValidLineCompletionsSpy.mockReturnValue([['1', '0', '0', '1', '1', '0']])

		const { completions, resultingLine } = useValidLineCompletions(input)

		expect(completions.value).toEqual([['1', '0', '0', '1', '1', '0']])
		expect(resultingLine.value).toEqual(['1', '0', '0', '1', '1', '0'])
	})

	it('should handle a line that is already complete', () => {
		const input = ref<PuzzleValueLineStr | null>('110010');
		const { completions, resultingLine } = useValidLineCompletions(input)

		expect(completions.value).toEqual([['1', '1', '0', '0', '1', '0']])
		expect(resultingLine.value).toEqual(['1', '1', '0', '0', '1', '0'])
	})

	it('should handle input with multiple completions', () => {
		const input = ref<PuzzleValueLineStr | null>('10..')
		getValidLineCompletionsSpy.mockReturnValue([
			['1', '0', '0', '1'],
			['1', '0', '1', '0']
		])

		const { completions, resultingLine } = useValidLineCompletions(input)

		expect(completions.value).toEqual([
			['1', '0', '0', '1'],
			['1', '0', '1', '0']
		])
		expect(resultingLine.value).toEqual(['1', '0', '.', '.'])
	})

	it('should return null for resultingLine when input is invalid', () => {
		const input = ref<PuzzleValueLineStr | null>('111...')

		const { completions, resultingLine } = useValidLineCompletions(input)

		expect(completions.value).toEqual([])
		expect(resultingLine.value).toBeNull()
	})
})