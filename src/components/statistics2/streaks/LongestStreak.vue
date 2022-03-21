<template>
	<section>
		<h2>Longest streak</h2>
		<div class="streak-length bg-gradient-to-br to-yellow-600 from-amber-400">
			<span>{{length}}</span>
		</div>
		<div class="text">
			<div v-if="fromStr && toStr">
				<span class="whitespace-nowrap">{{fromStr}}</span> - <span class="whitespace-nowrap">{{toStr}}</span>
			</div>
		</div>
	</section>
</template>

<script setup>
import { differenceInCalendarDays } from 'date-fns/esm';
import { computed } from 'vue';

const props = defineProps({
	length: {
		type: Number,
		required: true
	},
	from: {
		type: Date
	},
	to: {
		type: Date
	}
})

function formatDate(d) {
	return d.toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}
function formatRelativeDate(diffDays) {
	return new Intl.RelativeTimeFormat(undefined, {
		localeMatcher: 'best fit',
		numeric: "auto",
		style: "long"
	}).format(diffDays, 'day');
}

const fromStr = computed(() => {
	if (!props.from) return null;
	return formatDate(props.from);
})
const diffEndDate = computed(() => {
	return differenceInCalendarDays(props.to, new Date());
})

const toStr = computed(() => {
	if (!props.to) return null;
	if (props.length < 3 || Math.abs(diffEndDate.value) > 2) {
		return formatDate(props.to);
	} else return formatRelativeDate(diffEndDate.value);
})
</script>

<style scoped>

</style>