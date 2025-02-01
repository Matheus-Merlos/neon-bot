<script lang="ts">
    import "$lib/styles/global.css";

    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types'
	import Header from "$lib/components/Header.svelte";

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<style>
    main {
        background-color: var(--darker);
        height: 100vh;
    }
</style>

<Header stars={data.stars} />
<main>
    {@render children()}
</main>