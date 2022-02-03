<template>
	<div class="summary-card" :class="[color, { colored: color != null }]">
		<div class="title">{{title}}</div>
		<div class="value">{{value}}</div>
	</div>
</template>

<script>
export default {
	props: {
		color: {
			type: String
		},
		title: {
			type: String,
			required: true
		},
		value: {
			type: [String, Number],
			required: true
		}
	}
};
</script>

<style scoped>
.summary-card {
	@apply bg-white shadow-md rounded px-6 py-3 h-20 flex flex-col justify-center;
}
.summary-card.colored {
	@apply text-white bg-gradient-to-tl;
}

.summary-card.orange {
	@apply from-amber-600 to-amber-500;
}
.summary-card.green {
	@apply from-emerald-600 to-emerald-500;
}
.summary-card.blue {
	@apply from-sky-600 to-sky-500;
}
.summary-card.rose {
	@apply from-rose-600 to-rose-500;
}

.title {
	@apply text-sm opacity-95 tracking-wide;
}
.value {
	@apply font-semibold text-lg;
}
</style>