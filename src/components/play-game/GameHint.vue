<template>
	<div class="hint" :key="id" ref="hint" :class="{'not-at-top': distanceBottom > 5, 'not-at-bottom': distanceTop > 3}" @scroll="throttledScroll">
		<div class="scroll-shadow scroll-shadow-top"></div>

		<div class="close">
			<IconBtn size="16" @click="$emit('hide')">close</IconBtn>
		</div>
		<div class="message">
			{{message}}
		</div>
		<div class="actions" v-if="actions.length">
			<BaseButton class="" v-for="(action, idx) in actions" :key="action.idx" @click="executeAction(idx)">{{action.label}}</BaseButton>
		</div>

		<div class="scroll-shadow scroll-shadow-bottom"></div>
	</div>
</template>

<script>
import throttle from 'lodash.throttle';
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
				return []
			}
		}
	},
	data() {
		return {
			distanceBottom: 0,
			scrollHeight: 0,
		}
	},
	computed: {
		distanceTop() {
			if (!this.scrollHeight) return 0;
			return this.scrollHeight - this.distanceBottom;
		}
	},
	methods: {
		executeAction(idx) {
			const onClick = this.actions[idx].onClick;
			onClick(this, this.$store);
			this.$emit('done');
		},
		setDistanceBottom() {
			const el = this.$refs.hint;
			if (!el) {
				this.distanceBottom = 0;
				return;
			}
			const totalScrollHeight = el.scrollHeight - el.clientHeight;
			this.scrollHeight = totalScrollHeight;
			const scrollPos = el.scrollTop;
			if (!totalScrollHeight) {
				this.distanceBottom = 0;
				return;
			} else {
				this.distanceBottom = totalScrollHeight - scrollPos;
			}
		}
	},
	mounted() {
		this.setDistanceBottom();
	},
	created() {
		this.throttledScroll = throttle(this.setDistanceBottom, 1000 / 30);
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
	@apply mt-auto border-t bg-white text-gray-700 pointer-events-auto text-sm overflow-y-auto origin-bottom pl-2 pb-2;
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

.scroll-shadow {
	content: '';
	height: 6px;
	width: 100%;
	left: 0;
	position: absolute;	
	opacity: 0;
	transition: opacity .1s ease;
}
.scroll-shadow-bottom {
	bottom: 0;
	background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.08));
}
.scroll-shadow-top {
	top: 0;
	background: linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,0.05));
}
.hint.not-at-top .scroll-shadow-bottom {	
	opacity: 1;
}
.hint.not-at-bottom .scroll-shadow-top {	
	opacity: 1;
}
</style>