<template>
	<section>
		<h2>Longest streak</h2>
		<div class="streak-length border-4" :class="[streakLengthClasses]"
		><span :class="{
			'text-xl': length >= 100
		}">{{length}}</span></div>
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

const streakLengthClasses = computed(() => {
	if (props.length >= 28) {
		return ["border-purple-500", "text-purple-700/90", "bg-purple-400/20"];
	} else if (props.length > 7) {
		return ["border-green-500", "text-green-700/90", "bg-green-400/20"];
	} else if (props.length > 1) {
		return ["border-gray-500/50", "text-gray-500", "bg-gray-300/10"];
	} else if (props.length <= 1) return ["border-gray-500/50", "text-gray-500", "bg-gray-300/10", "opacity-60"]
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