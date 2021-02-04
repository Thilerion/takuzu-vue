<template>
	<main>
		<button @click="addText">Add text</button>
		<button @click="clearText">Clear text</button>
		<div>
			<p v-for="(str, idx) in text" :key="idx">{{str}}</p>
		</div>
	</main>
</template>

<script>
export default {
	data() {
		return {
			text: []
		}
	},
	methods: {
		addText() {
			this.text.push('Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est voluptatum sunt in fuga. Necessitatibus quas perspiciatis laboriosam corrupti fuga corporis quaerat consequuntur voluptates praesentium provident aperiam suscipit totam a libero, pariatur voluptatum hic cum reprehenderit iusto illum, dolorem nostrum. Mollitia adipisci odio quisquam aliquam accusantium dignissimos pariatur alias necessitatibus similique!');
		},
		clearText() {
			this.text = [];
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>