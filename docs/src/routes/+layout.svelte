<script lang="ts">
    import '$lib/styles/global.css';

    import Header from '$lib/components/Header.svelte';
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<Header stars={data.stars} firstCommandSlug={data.firstCommandSlug} />
<main>
    {@render children()}
</main>
