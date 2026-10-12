<script lang="ts">
	import { socialLogos, type SocialBrand } from './social-logos';

	let {
		brand,
		label,
		tone = 'inherit'
	}: { brand: SocialBrand; label?: string; tone?: 'inherit' | 'brand' } = $props();

	const logo = $derived(socialLogos[brand]);
</script>

<svg
	class="social-logo"
	data-brand={brand}
	data-tone={tone}
	viewBox="0 0 24 24"
	fill="currentColor"
	role={label ? 'img' : undefined}
	aria-hidden={label ? undefined : 'true'}
>
	{#if label}<title>{label}</title>{/if}
	<path d={logo.path} transform={logo.transform || undefined} />
</svg>
