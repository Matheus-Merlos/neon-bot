<script lang="ts">
    import "$lib/styles/global.css";

    import Header from "$lib/components/Header.svelte";
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

<style>
    main {
        background-color: var(--darker);
    }
</style>

<Header stars={data.stars} />
<main>
    {@render children()}
</main>