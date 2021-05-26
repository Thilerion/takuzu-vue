<template>
	<div class="hint" :key="id">
		<div class="close">
			<IconBtn size="16" @click="$emit('hide')">close</IconBtn>
		</div>
		<div class="message">
			{{message}}
		</div>
		<div class="actions" v-if="actions.length">
			<BaseButton v-for="(action, idx) in actions" :key="action.idx" @click="executeAction(idx)">{{action.label}}</BaseButton>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		message: {
			type: String,
			required: true,
		},
		id: {
			type: [Number, String],
			required: true,
		},
		actions: {
			type: Array,
			default() {
				return [];
			}
		},
		hint: Object
	},
	methods: {
		executeAction(idx) {
			const onClick = this.actions[idx].onClick.bind(this);
			onClick(this, this.$store, this.hint);
			this.$emit('done');
		},
	}
};
</script>

<style lang="postcss" scoped>
.hint {
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto min-content;
	grid-template-areas: "message close"
		"actions actions";
	row-gap: 0.5rem;
	column-gap: 0.5rem;
	box-shadow: 0 5px 10px rgba(0,0,0,0.19), 0 3px 3px rgba(0,0,0,0.23);
	min-height: 4rem;
	@apply mt-auto border-t bg-white text-gray-800 pointer-events-auto text-xs overflow-y-auto origin-bottom pl-2 pb-2 w-full;
}
.close {
	grid-area: close;
	@apply flex justify-start items-start pr-1 pt-1;
}
.message {
	grid-area: message;
	@apply px-2 pt-3;
}
.actions {
	grid-area: actions;
	@apply px-2 pb-2;
}

.hint-fade-enter-active {
  	transition: opacity .30s ease .05s, transform .35s ease;
}
.hint-fade-leave-active {
  	transition: opacity .1s ease .2s, transform .20s ease .2s;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
	opacity: 0;
	transform: scale(0.8);
}
</style>