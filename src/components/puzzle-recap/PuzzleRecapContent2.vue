<template>
	<div class="recap-modal scale-100 min-w-[300px] min-h-[200px] max-w-xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col m-auto bg-white text-gray-900 w-full">
		<div class="bg-gradient-to-t from-teal-200/70 via-teal-200/20 to-transparent bg-teal-600 text-white rounded-b-[25%]">
			<div class="flex flex-row justify-evenly gap-3 text-center py-4 px-2">
				<div class="py-2 px-4 w-1/3 text-center">
					<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Size</div>
					<div class="min-w-max">8x8</div>
				</div>
				<div class="py-2 px-4 flex-1 min-w-[30%] text-center rounded bg-black/10">
					<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Solved</div>
					<div class="min-w-max">68</div>
				</div>
				<div class="py-2 px-4 w-1/3 text-center">
					<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Difficulty</div>
					<div class="min-w-max">2* Easy</div>
				</div>
			</div>

			<div class="time-box w-full text-white text-3xl text-center py-3">
				<span class="drop-shadow-sm">01:14</span>
			</div>
		</div>

		<div class="recap-time-stats text-sm px-6 py-4 flex flex-row justify-evenly items-center gap-8 min-w-max w-3/4 max-w-sm mx-auto">
			<div class="min-w-max">
				<div class="mx-auto flex flex-col items-start text-left">
					<div class="text-xs">Best time</div>
					<div class="text-base flex flex-row items-center">
						<span class="text-base">01:14</span>
						<!-- <span class="line-through decoration-green-500/60 decoration-2 text-gray-600 ml-1 text-xs">01:01</span> -->
					</div>
				</div>
			</div>
			<div class="min-w-max">
				<div class="mx-auto flex flex-col items-start text-left">
				<div class="text-xs">Average</div>
				<div class="text-base">01:51</div>
				</div>
			</div>
		</div>

		<div class="min-w-min max-w-xs px-2 w-[70vw] mx-auto mb-4">
			<div class="recap-message stats-button-wrapper border-t border-b pt-4 pb-3 border-gray-200 text-center px-2 text-sm">
			<div class="mb-2"><span>You were 12s faster than your previous&nbsp;average!</span></div>
			<button
				class="stats-btn"
				@click="$emit('exit-to', 'statistics')"
			><icon-ic-baseline-leaderboard/><span>View all statistics</span></button>
		</div>
		</div>
		

		<div class="recap-btns px-2 mx-auto text-center grid gap-x-2 gap-y-3 mb-4 w-[70vw] min-w-max max-w-md pt-2">
			<BaseButton class="btn-elevated h-8 text-xs row-span-1">Home</BaseButton>
			<BaseButton class="btn-elevated h-8 text-xs row-span-1">Change Level</BaseButton>
			<BaseButton class="text-sm h-14 btn-primary row-start-2 col-start-1 col-span-2">Play Again >></BaseButton>
		</div>
	</div>
</template>

<script setup>
import BaseButton from '../global/BaseButton.vue';

</script>

<style scoped>
.recap-modal {
	/* box-shadow: rgba(var(--shadow-col), 0.35) 0px 5px 15px; */
	--shadow-col: 10, 40, 10;
	box-shadow: rgba(var(--shadow-col), 0.25) 0px 54px 55px, rgba(var(--shadow-col), 0.12) 0px -12px 30px, rgba(var(--shadow-col), 0.12) 0px 4px 6px, rgba(var(--shadow-col), 0.17) 0px 12px 13px, rgba(var(--shadow-col), 0.09) 0px -3px 5px;
}

.time-box {
	box-shadow: inset 0px -20px 50px -39px rgba(255, 255, 255, 0.2);
}

.recap-btns {
	grid-template-rows: auto auto;
	grid-template-columns: 1fr 1fr;
}

.stats-btn {
	@apply mx-auto flex w-2/3 justify-center items-center font-medium cursor-pointer py-1 text-gray-700;
}
</style>