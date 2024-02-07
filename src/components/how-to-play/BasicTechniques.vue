<template>
	<div class="prose prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto p-4 basic-techniques-page">
		<h2>Basic Techniques</h2>
		<p>Below, we've outlined some fundamental strategies to help you navigate through the puzzles with ease.</p>

		<div class="techniques">
			<h3>Identifying Pairs and Sandwiches</h3>
			<p>A direct application of the "max two consecutive" rule is to avoid forming triplets within the puzzle grid. This rule is pivotal in guiding you on where to place symbols logically.</p>

			<h4>Pairs</h4>
			<p>Whenever you observe two identical symbols next to each other, either horizontally or vertically, this forms a "pair." The cells immediately adjacent to this pair must be filled with the opposite symbol to prevent creating a sequence of three identical symbols (a triplet).</p>

			<h4>Sandwiches</h4>
			<p>A "sandwich" occurs when an empty cell is flanked by two identical symbols. This setup mandates that the empty cell, effectively the "filling" of the sandwich, be filled with the opposite symbol to avoid the formation of triplets.</p>

			<h3>Completing Rows and Columns</h3>
			<p>This technique stems from the "balanced lines" rule, which stipulates that each row and column must contain an equal number of zeros and ones. As you fill in the puzzle, keep track of the balance within each row and column to guide your placement decisions.</p>
			<p><strong>Tip: </strong> a setting is available that adds a horizontal and vertical ruler to the puzzle grid. These rulers display how many of each symbol still need to be placed in that row or column, and highlight whenever a line has none remaining of a single symbol, which means it can be completed with the other symbol.</p>

			<h3>Unique Rows and Columns</h3>
			<p>This strategy is often not a necessity for solving puzzles, especially at easier difficulties, thanks to the tailored puzzle generation algorithm. Its utility shines on smaller boards or during tougher challenges where other strategies might leave you in a standstill.</p>
			<p><strong>When to use: </strong>It's especially helpful in scenarios where a line is almost complete yet cannot be completed using the basic rules of balancing, sandwiches, or pairs. If you're leveraging the rulers setting that indicates the remaining number of each symbol needed in a row or column, pay close attention to lines that require the placement of exactly one '1' and one '0'. Compare these scenarios with existing lines to identify the correct placements.</p>
		</div>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.basic-techniques-page {
	counter-reset: technique-heading 0;
}

.techniques h3 {
	@apply relative pl-[1.875ch];
}
.techniques h4 {
	@apply relative pl-[3ch];
}

.techniques h3 {
	counter-reset: sub-technique-heading 0;
}

.techniques h3::before {
	counter-increment: technique-heading 1;
	content: counter(technique-heading)".";
	@apply absolute left-0 opacity-60;
}

.techniques h4::before {
	counter-increment: sub-technique-heading 1;
	content: counter(technique-heading) counter(sub-technique-heading, lower-alpha)".";
	@apply absolute left-0 opacity-60;
}

</style>