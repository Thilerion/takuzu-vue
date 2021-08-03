<template>
	<VIcon :name="name" />
</template>

<script>
import VIcon from "oh-vue-icons/dist/v3/icon.es";
import { MdArrowback, MdMorevert, MdClose, MdUndo, MdReplay, MdDone, HiSolidLightBulb, FaRegularCopy, FaPause, MdSettings, MdEmojievents } from 'oh-vue-icons/icons';
VIcon.add(MdArrowback, MdMorevert, MdClose, MdUndo, MdReplay, MdDone, HiSolidLightBulb, FaRegularCopy, FaPause, MdSettings, MdEmojievents );

export default {
	components: {
		VIcon
	},
	props: {
		name: {
			validator(value) {
				return Object.keys(VIcon.icons).includes(value);
			},
			required: true
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>