<script lang="ts">
    import "$lib/styles/global.css";

    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
</script>

<style>
    main {
        background-color: var(--darker);
        height: 100vh;
    }
</style>

<main>
    {@render children()}
</main>