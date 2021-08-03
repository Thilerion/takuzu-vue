<template>
	<button class="icon-btn">
		<ui-icons :name="name" :scale="scale" />
	</button>
</template>

<script>
import UiIcons from '@/components/common/UiIcons.vue';
// Back, MoreVert, Close, Undo, Replay, Done, EmojiObjects
// MdArrowback, MdMorevert, MdClose, MdUndo, MdReplay, MdDone, HiSolidLightBulb
export default {
	components: { UiIcons },
	props: {
		size: {
			type: [String, Number],
			default: 24
		},
		scale: {
			type: [String, Number],
			default: '1.25'
		},
		name: {
			type: String,
			required: true
		}
	}
};
</script>

<style lang="postcss" scoped>
.icon-btn {
	@apply flex items-center justify-center rounded-full active:bg-gray-300 outline-none text-current select-none p-2;
	-webkit-tap-highlight-color: transparent;
	width: var(--size);
	height: var(--size);
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}

@media (hover:hover) and (pointer:fine) {
	.icon-btn {
		@apply hover:bg-gray-200 active:bg-gray-300;
	}
}
</style>