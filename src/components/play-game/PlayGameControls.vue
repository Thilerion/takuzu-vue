<template>
	<div class="controls flex items-center justify-center text-gray-700">
		<IconBtnText @click="undo" :disabled="!canUndo" size="26" icon="undo">
			Undo
		</IconBtnText>
		<IconBtnText @click="restart" size="26" icon="replay">
			Restart
		</IconBtnText>
		<IconBtnText
			size="26"
			icon="done"
			@click="check"
			v-if="checkButtonEnabled && !isDevelopment"
		>
			Check
		</IconBtnText>
		<template v-if="isDevelopment">
			<IconBtnText
				size="26"
				icon="done"
				@click="checkRuleViolations"
			>
				Violations
			</IconBtnText>
			<IconBtnText
				size="26"
				icon="done"
				@click="checkIncorrectValues"
			>
				Mistakes
			</IconBtnText>
		</template>
		<IconBtnText size="26" icon="emoji_objects">				
			Hint
		</IconBtnText>
	</div>
</template>

<script>
import IconBtnText from '@/components/base-layout/IconBtnText';
import Solver from '../../lib/solver/Solver';

export default {
	components: {
		IconBtnText,
	},
	data() {
		return {
			isDevelopment: process.env.NODE_ENV === 'development',
		}
	},
	computed: {
		canUndo() {
			return this.$store.getters.canUndo;
		},
		board() {
			return this.$store.state.game.board;
		},
		checkButtonEnabled() {
			return this.$store.state.settings.checkButton !== 'disabled';
		}
	},
	methods: {
		undo() {
			this.$store.dispatch('undo');
		},
		restart() {
			this.$store.dispatch('restartPuzzle');
		},
		check() {
			this.$store.dispatch('checkAction').then(hasErrors => {
				console.log({hasErrors});
				this.$emit('error-check', { hasErrors });
			});
		},
		checkRuleViolations() {
			this.$store.dispatch('gameCheck/findRuleViolations').then(hasErrors => {
				console.log({hasErrors});
				this.$emit('error-check', { hasErrors });
			});
		},
		checkIncorrectValues() {
			this.$store.dispatch('gameCheck/findIncorrectValues').then(hasErrors => {
				console.log({hasErrors});
				this.$emit('error-check', { hasErrors });
			});
		},
		showHint() {
			// TODO: not yet implemented hinting system
			console.warn('Hints not yet implemented');
		},
		showSolution() {
			console.log(this.board.copy());
			const config = {
				maxSolutions: 2,
				timeoutDuration: 500,
				throwAfterTimeout: true,
				disableBacktracking: true
			}
			const solutions = Solver.run(this.board.copy(), config);
			console.log({solutions});

			if (solutions.length === 1) {
				this.$store.commit('setBoard', solutions[0].copy());
			} else {
				console.warn('NO SINGLE SOLUTION FOUND');
			}
		},
		async logString() {
			const str = this.board.toString();
			try {
				await navigator.clipboard.writeText(str);
				console.log('Succesfully copied to clipboard.');
			} catch(err) {
				console.warn('Failed writing to clipboard.');
				console.warn(err);
			} finally {
				console.log(str);
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.controls {
	@apply flex items-center justify-center w-full mt-auto mb-2;
}
.controls > * {
	@apply mr-2 text-xs flex flex-col justify-start flex-auto;
}
.controls > *:last-child {
	@apply mr-0;
}
</style>