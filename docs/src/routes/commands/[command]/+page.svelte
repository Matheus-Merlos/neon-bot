<script lang="ts">
    import '$lib/styles/pages/command.css';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let { command } = data;

    const commandHTML = command.description;
</script>

<article>
    <h1>{command.name}</h1>
    <!-- eslint-disable-next-line svelte/no-at-html-tags-->
    {@html commandHTML}
</article>
