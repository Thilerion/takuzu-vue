<template>
<div class="min-h-screen w-full">
	<PageHeader 
		:transparent="false"
		small
		elevated
		class="flex-shrink-0"
	>
		Component Showcase
	</PageHeader>
	<section class="p-4">
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
			<BaseModal
				ref="modal2"
				v-slot="{ close }"
				prevent-close
			>
				<h2 class="mb-2 text-xl">Scroll + prevent bg close</h2>
				<div>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet debitis vel, est tempora animi quod quisquam, quo magni aliquam a voluptatibus nam dolor illum explicabo libero sunt, iusto consequuntur temporibus. Possimus, vel fugit. Maiores reiciendis porro nemo excepturi dolor iure! Praesentium recusandae exercitationem, quidem quaerat reprehenderit magni odio voluptatem sapiente.</div>
				<div>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sint nihil eos eum eveniet cupiditate id laboriosam nisi consequuntur quia facilis dolore earum consectetur fuga corporis incidunt dolorum illum magni nemo culpa ab quasi odit, laudantium laborum. Corporis quidem nam dolore harum. Officia alias corporis, dolore ab ipsum impedit! Aspernatur, commodi!</div>
				<div>Ipsam ut unde molestiae voluptatum, expedita quasi dolor esse quas sapiente eaque praesentium rerum quo perspiciatis iste alias eveniet eos nemo beatae at fugit magni numquam laudantium. Odit enim commodi, eaque consequatur illum et? Eaque nemo possimus distinctio harum eos vero! Exercitationem eius cum dicta distinctio perspiciatis aliquam, recusandae ducimus?</div>
				<div>Impedit architecto aspernatur cum veniam voluptas magnam labore. Nesciunt perspiciatis soluta voluptas iusto architecto, quibusdam inventore dolorem omnis expedita numquam doloribus ipsam consectetur iure tenetur similique iste quas repellat officia. Nulla repudiandae blanditiis iure ipsam, ipsum cumque praesentium assumenda, omnis inventore fugit debitis voluptate distinctio? Ad qui sunt iste voluptatem?</div>
				<BaseButton @click="close">Close</BaseButton>
			</BaseModal>
		</div>

		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Native Dialog</h2>
			<BaseButton @click="showDialog1 = true">Open Dialog 1</BaseButton>
			<BaseDialog
				v-model="showDialog1"
				prevent-cancel
			>
				<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias hic excepturi aspernatur labore non quas. A laudantium ea quas ipsa enim odio molestiae. Voluptate recusandae nam nemo, placeat accusantium impedit! Nihil illum consectetur officia vel voluptas sunt dolorum rerum sint. Labore obcaecati numquam deserunt accusamus.</p>
				<p>Fugit dolorem, debitis reiciendis molestias, qui corrupti aperiam repudiandae rerum maxime ratione, a mollitia earum.</p>
				<p>Optio quam impedit consequatur eum neque magnam. Doloremque fugiat magni aperiam expedita non sint vero.</p>
				<p>Quasi, labore sequi iste nemo dignissimos similique aspernatur vero, temporibus, quae nesciunt delectus numquam optio?</p>
				<p>Nulla, quod, officiis reprehenderit voluptates, ut velit impedit a obcaecati pariatur corrupti vel aperiam itaque.</p>
				<p>Earum consequatur est velit optio hic. Necessitatibus exercitationem libero quae saepe soluta explicabo adipisci a.</p>
				<p>Quod, atque quaerat, reprehenderit non sit exercitationem est tempora rerum blanditiis, soluta animi hic. Quas!</p>
				<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt aspernatur fugit animi. Necessitatibus recusandae deserunt ea rerum ipsam alias, aliquam nihil, a, autem dolores omnis saepe! Impedit minima temporibus eos pariatur? Accusamus tempora numquam corrupti vel asperiores, nulla aspernatur officia sed. Tenetur quisquam nobis tempore repellat aut tempora eos voluptates!</p>
				<p>Reprehenderit officiis reiciendis iusto ratione quia repellat? Doloribus exercitationem neque accusantium. Asperiores voluptatem saepe, necessitatibus expedita quod commodi eum excepturi aliquam delectus quo alias, molestias eos in, fuga vel placeat hic culpa laboriosam? Unde, excepturi nihil! Beatae culpa alias quia ipsum repudiandae aut voluptatum adipisci aliquam unde explicabo! Voluptatibus, aut.</p>
				<p>Eaque, facere. Quos corrupti deleniti deserunt. Eveniet inventore corporis aperiam sint itaque ad vel illum quibusdam saepe enim. Culpa dolorem aliquid ipsam magnam quo eaque nesciunt consequatur? Aut ex eaque inventore aperiam quos labore maiores fuga vitae eum numquam in voluptatibus quia error impedit voluptates quas nesciunt nemo, quisquam ducimus.</p>
				<p>Fugit aliquam omnis explicabo. Consequatur nisi beatae minus maxime nostrum voluptatibus, hic itaque pariatur ducimus provident accusamus odio qui porro ratione in cupiditate nemo atque deserunt, eius aspernatur inventore reiciendis? Ullam sapiente possimus sequi necessitatibus labore quod alias quia dolore quaerat, distinctio maiores quasi consequatur officiis at soluta quo rerum?</p>
				<p>Reiciendis, magni neque delectus voluptas natus iure. Deserunt voluptates esse odio, placeat porro ullam est fuga adipisci molestias, recusandae, repudiandae distinctio corporis sit! Inventore at natus mollitia cupiditate suscipit dolorum cum voluptatem dolores assumenda temporibus. Vero odit sed, magnam quia fuga pariatur. Ipsam facilis autem officia quis molestiae possimus fuga!</p>
				<BaseButton @click="showDialog1 = false">Close</BaseButton>
			</BaseDialog>
		</div>

		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Dropdown</h2>
			<BaseDropdown>
				<template #trigger="{open}">
					<BaseButton @click="open">DD</BaseButton>
				</template>
			</BaseDropdown>
			<BaseDropdown align-below>
				<template #trigger="{toggle}">
					<BaseButton @click="toggle">DD below</BaseButton>
				</template>
				<template #content>
					<BaseDropdownItem>Other item</BaseDropdownItem>
					<BaseDropdownItem>Yet another dropdown item</BaseDropdownItem>
					<BaseDropdownDivider />
					<BaseDropdownItem>I can be clicked!</BaseDropdownItem>
				</template>
			</BaseDropdown>
			<BaseDropdown align-below align-right>
				<template #trigger="{toggle}">
					<BaseButton @click="toggle">DD right</BaseButton>
				</template>
				<template #content>
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
					<InputToggle
						id="input-2-value"
						v-model="input1Value"
						small
						inline
					/>
					<label for="input2-value" class="ml-2">value is: {{ input1Value }}</label>
				</div>
				<div>
					<label for="baseRange" class="w-full flex justify-between items-center">Base range <span class="text-xs">({{ baseRangeValue }})</span></label>
					<input
						id="baseRange"
						v-model="baseRangeValue"
						type="range"
						min="0"
						max="100"
						step="5"
					>
				</div>
				<div>
					<label for="componentRange" class="w-full flex justify-between items-center">Component range <span class="text-xs">({{ componentRangeValue }})</span></label>
					<InputRange
						id="componentRange"
						v-model="componentRangeValue"
						min="0"
						max="100"
						step="5"
					/>
				</div>
			</div>
		</div>

		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Collapsible</h2>
			<div class="flex flex-col gap-y-4">
				<div>Current state: {{ collapsibleCurrentState }}</div>
				<BaseCollapsible
					default-open
					@after-close="collapsibleCurrentState = 'closed'"
					@after-open="collapsibleCurrentState = 'open'"
					@toggled="collapsibleCurrentState = `going to ${$event}`"
				>
					<BaseCollapsibleTrigger>
						<BaseButton>Toggle!!</BaseButton>
					</BaseCollapsibleTrigger>
					<BaseCollapsibleContent>
						HI THERE!!
					</BaseCollapsibleContent>
				</BaseCollapsible>
			</div>
		</div>
		<div class="showcase-block">
			<h2 class="text-xl mb-6 pb-1 font-medium border-b self-stretch">Collapsible</h2>
			<div class="flex flex-col gap-y-4">
				<BaseCollapsible
					v-model="baseCollapsibleModel"
				>
					<BaseCollapsibleTrigger>
						<BaseButton>Toggle!!</BaseButton>
					</BaseCollapsibleTrigger>
					<BaseCollapsibleContent>
						HI THERE!!
					</BaseCollapsibleContent>
				</BaseCollapsible>
			</div>
		</div>
	</section>

	<FullWidthPanelLayout class="fwp-layout-showcase">
		<FullWidthPanelBasicCard>
			<template #sectionTitle>Section title</template>
			<template #content>
				<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est rerum, mollitia nihil voluptas fugit vero quae recusandae iusto nobis ex!</p>
				<p>Mollitia alias, quae laboriosam, soluta sint ducimus voluptatum assumenda eaque optio vitae quas nemo velit, dicta incidunt libero non dolor!</p>
				<p>Animi saepe error doloribus dignissimos illum praesentium odio accusamus officia molestiae in possimus natus, dicta assumenda ipsam ipsa dolorem maxime?</p>
			</template>
		</FullWidthPanelBasicCard>
		<FullWidthPanelBasicCard>
			<template #cardTitle>Card title</template>
			<template #content>
				<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est rerum, mollitia nihil voluptas fugit vero quae recusandae iusto nobis ex!</p>
				<p>Mollitia alias, quae laboriosam, soluta sint ducimus voluptatum assumenda eaque optio vitae quas nemo velit, dicta incidunt libero non dolor!</p>
				<p>Animi saepe error doloribus dignissimos illum praesentium odio accusamus officia molestiae in possimus natus, dicta assumenda ipsam ipsa dolorem maxime?</p>
			</template>
		</FullWidthPanelBasicCard>
		<FullWidthPanelBasicCard>
			<template #content>
				<p>This is a card without a title.</p>
				<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est rerum, mollitia nihil voluptas fugit vero quae recusandae iusto nobis ex!</p>
				<p>Mollitia alias, quae laboriosam, soluta sint ducimus voluptatum assumenda eaque optio vitae quas nemo velit, dicta incidunt libero non dolor!</p>
				<p>Animi saepe error doloribus dignissimos illum praesentium odio accusamus officia molestiae in possimus natus, dicta assumenda ipsam ipsa dolorem maxime?</p>
			</template>
		</FullWidthPanelBasicCard>

		<FullWidthPanelCollapsible>
			<template #cardTitle>Collapsible section</template>
			<template #content>
				<p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Amet nostrum nulla aspernatur labore explicabo rerum veniam dolores voluptatum voluptatibus porro!</p>
				<p>Et voluptas corrupti animi iste autem, provident distinctio voluptatibus molestiae aliquid iusto recusandae impedit ullam. Facilis, laudantium. Veniam, quaerat labore?</p>
				<p>Molestias culpa quo, possimus voluptates consectetur dolores eius numquam assumenda sunt expedita. Cum, consequuntur quia autem quo illum numquam id.</p>
			</template>
		</FullWidthPanelCollapsible>
	</FullWidthPanelLayout>
	
	<div class="w-full h-24"></div>
</div>
</template>

<script setup lang="ts">
import type BaseModal from '@/components/base/BaseModal.vue';
import { watchEffect } from 'vue';
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

const showDialog1 = ref(false);

const collapsibleCurrentState = ref('nothing');
const baseCollapsibleModel = ref(true);
watchEffect(() => {
	const collapsibleModelValue = baseCollapsibleModel.value;
	console.log({ collapsibleModelValue });
})
</script>

<style scoped>
.showcase-block {
	@apply bg-gray-100 p-4 pb-2 rounded-lg border mb-4;
}

.button-col > .btn {
	@apply mb-4;
}

.fwp-layout-showcase p:not(:last-child) {
	@apply mb-4;
}
</style>