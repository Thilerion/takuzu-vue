<template>
	<BaseDropdown
		align-right
		align-below
		ref="dropdown"
		@toggled="dropdownToggled"
	>
		<template #trigger="{open}">
			<IconBtn @click="open">more_vert</IconBtn>
		</template>
		<template #content>
			<BaseDropdownItem disabled>
				<span class="material-icons opacity-90 text-base">bookmark_add</span>
				<span class="ml-3 mt-px">Set bookmark</span>
			</BaseDropdownItem>
			<BaseDropdownItem disabled>
				<span class="material-icons opacity-90 text-base">bookmark_remove</span>
				<span class="ml-3 mt-px">Delete bookmark</span>
			</BaseDropdownItem>
			<BaseDropdownDivider/>
			<BaseDropdownItem>
				<label class="flex items-center">
					<input type="checkbox" v-model="showTimer">
					<span class="ml-2">Show timer</span>
				</label>
			</BaseDropdownItem>
			<BaseDropdownDivider/>

			<template v-if="devModeEnabled">
				<BaseDropdownItem @click="copyPuzzleString">
					<span class="material-icons opacity-90 text-base">content_copy</span>
					<span class="ml-3 mt-px">Copy board string</span>
					<span v-if="copyError" class="ml-2 text-xs text-red-700 mt-px">{{copyError}}</span>
				</BaseDropdownItem>
				<BaseDropdownItem @click="solvePuzzle">
					<span class="ml-7 mt-px">Solve puzzle</span>
				</BaseDropdownItem>
				<BaseDropdownDivider/>
			</template>

			<BaseDropdownItem @click="goToSettings"
			>
				<span class="material-icons opacity-90 text-base">settings</span>
				<span class="ml-3 mt-px">Settings</span>
			</BaseDropdownItem>
		</template>
	</BaseDropdown>
</template>

<script>
import { rafPromise, timeoutPromise } from '@/utils/delay.utils';

export default {
	emits: ['open-settings', 'dropdown-toggled'],
	data() {
		return {
			copyError: null
		}
	},
	computed: {
		devModeEnabled() {
			return this.$store.state.devMode;
		},
		showTimer: {
			get() {
				return this.$store.state.settings.showTimer;
			},
			set(value) {
				this.$store.commit('settings/setSetting', {
					key: 'showTimer',
					value
				});
			}
		},
		board() {
			return this.$store.state.puzzle.board;
		}
	},
	methods: {
		goToSettings() {
			this.$refs.dropdown.closeDropdownMenu();
			this.$emit('open-settings');
		},
		async copyPuzzleString() {
			try {
				const boardStr = this.$store.state.puzzle.board.export();
				await navigator.clipboard.writeText(boardStr);
				console.log('copied to clipboard!');
				console.log(boardStr);		
			} catch(e) {
				console.warn('could not copy to clipboard...');
				console.warn(e);
			}
			this.$refs.dropdown.closeDropdownMenu();
		},
		async solvePuzzle() {
			this.$refs.dropdown.closeDropdownMenu();

			const emptyCells = [...this.$store.state.puzzle.board.cells({ skipFilled: true})];
			if (emptyCells.length <= 1) return;
			const cells = emptyCells.slice(0, -1);

			await timeoutPromise(500);

			for (const cell of cells) {
				const { x, y, value: prevValue } = cell;
				const solutionValue = this.$store.state.puzzle.solution.get(x, y);
				await rafPromise();
				this.$store.dispatch('puzzle/toggle', {
					x, y, prevValue, value: solutionValue
				});
			}			
		},
		dropdownToggled(value) {
			console.log('Dropdown state toggled: ' + value);
			this.$emit('dropdown-toggled', value);
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>