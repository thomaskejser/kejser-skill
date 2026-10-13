<script lang="ts">
	let {
		html,
		as = 'article',
		class: className
	}: { html: string; as?: 'article' | 'section' | 'div'; class?: string } = $props();
</script>

<svelte:element this={as} class={['prose', className]}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- html comes from our own Markdown, rendered by markdown.ts at build time -->
	{@html html}
</svelte:element>
