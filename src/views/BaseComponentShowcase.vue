<template>
	<div class="p-4 min-h-screen w-full">
		<div class="showcase-block button-col w-full flex flex-col items-start">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Buttons</h2>
			<BaseButton>Click here!</BaseButton>
			<BaseButton class="btn-primary">Primary</BaseButton>
			<BaseButton class="btn-elevated">Elevated</BaseButton>
		</div>

		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Modal</h2>
			<BaseButton @click="openModal('modal1')">Open modal 1</BaseButton>
			<BaseButton @click="openModal('modal2')">Open modal 2</BaseButton>
			<BaseModal ref="modal1">
				<div>This modal can be closed by clicking the background only.</div>
				<div>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet debitis vel, est tempora animi quod quisquam, quo magni aliquam a voluptatibus nam dolor illum explicabo libero sunt, iusto consequuntur temporibus. Possimus, vel fugit. Maiores reiciendis porro nemo excepturi dolor iure! Praesentium recusandae exercitationem, quidem quaerat reprehenderit magni odio voluptatem sapiente.</div>
			</BaseModal>
			<BaseModal prevent-close ref="modal2" v-slot="{ close }">
				<h2 class="mb-2 text-xl">Scroll + prevent bg close</h2>
				<div>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet debitis vel, est tempora animi quod quisquam, quo magni aliquam a voluptatibus nam dolor illum explicabo libero sunt, iusto consequuntur temporibus. Possimus, vel fugit. Maiores reiciendis porro nemo excepturi dolor iure! Praesentium recusandae exercitationem, quidem quaerat reprehenderit magni odio voluptatem sapiente.</div>
				<div>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sint nihil eos eum eveniet cupiditate id laboriosam nisi consequuntur quia facilis dolore earum consectetur fuga corporis incidunt dolorum illum magni nemo culpa ab quasi odit, laudantium laborum. Corporis quidem nam dolore harum. Officia alias corporis, dolore ab ipsum impedit! Aspernatur, commodi!</div>
				<div>Ipsam ut unde molestiae voluptatum, expedita quasi dolor esse quas sapiente eaque praesentium rerum quo perspiciatis iste alias eveniet eos nemo beatae at fugit magni numquam laudantium. Odit enim commodi, eaque consequatur illum et? Eaque nemo possimus distinctio harum eos vero! Exercitationem eius cum dicta distinctio perspiciatis aliquam, recusandae ducimus?</div>
				<div>Impedit architecto aspernatur cum veniam voluptas magnam labore. Nesciunt perspiciatis soluta voluptas iusto architecto, quibusdam inventore dolorem omnis expedita numquam doloribus ipsam consectetur iure tenetur similique iste quas repellat officia. Nulla repudiandae blanditiis iure ipsam, ipsum cumque praesentium assumenda, omnis inventore fugit debitis voluptate distinctio? Ad qui sunt iste voluptatem?</div>
				<BaseButton @click="close">Close</BaseButton>
			</BaseModal>
		</div>
		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Dropdown</h2>
			<BaseDropdown>
				<template v-slot:trigger="{open}">
				<BaseButton @click="open">DD</BaseButton>
				</template>
			</BaseDropdown>
			<BaseDropdown align-below>
				<template v-slot:trigger="{toggle}">
				<BaseButton @click="toggle">DD below</BaseButton>
				</template>
				<template v-slot:content>
					<BaseDropdownItem>Other item</BaseDropdownItem>
					<BaseDropdownItem>Yet another dropdown item</BaseDropdownItem>
					<BaseDropdownDivider />
					<BaseDropdownItem>I can be clicked!</BaseDropdownItem>
				</template>
			</BaseDropdown>
			<BaseDropdown align-below align-right>
				<template v-slot:trigger="{toggle}">
				<BaseButton @click="toggle">DD right</BaseButton>
				</template>
				<template v-slot:content>
					<BaseDropdownItem>Other item</BaseDropdownItem>
					<BaseDropdownItem>Yet another dropdown item</BaseDropdownItem>
					<BaseDropdownDivider />
					<BaseDropdownItem>I can be clicked!</BaseDropdownItem>
				</template>
			</BaseDropdown>
		</div>
		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Form inputs</h2>
			<div class="flex flex-col gap-y-4">
				<div>
					<InputToggle small v-model="input1Value" inline id="input-2-value" />
					<label for="input2-value" class="ml-2">value is: {{input1Value}}</label>
				</div>
				<div>
					<label for="baseRange" class="w-full flex justify-between items-center">Base range <span class="text-xs">({{baseRangeValue}})</span></label>
					<input type="range" id="baseRange" v-model="baseRangeValue" min="0" max="100" step="5">
				</div>
				<div>
					<label for="componentRange" class="w-full flex justify-between items-center">Component range <span class="text-xs">({{componentRangeValue}})</span></label>
					<InputRange id="componentRange" v-model="componentRangeValue" min="0" max="100" step="5" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type BaseModal from '@/components/global/BaseModal.vue';
import { ref } from 'vue';

const baseRangeValue = ref(40);
const componentRangeValue = ref(60);

const input1Value = ref(true);

const modal1 = ref<InstanceType<typeof BaseModal> | null>(null);
const modal2 = ref<InstanceType<typeof BaseModal> | null>(null);
const modalRefs = {
	modal1,
	modal2
} as const;

const openModal = (refName: keyof typeof modalRefs) => {
	const modalRef: InstanceType<typeof BaseModal> | null = modalRefs[refName].value;
	if (modalRef != null && !!modalRef.open) {
		modalRef.open();
	}
}
</script>

<style scoped>
.showcase-block {
	@apply bg-gray-100 p-4 pb-2 rounded-lg border mb-4;
}

.button-col > .btn {
	@apply mb-4;
}
</style>