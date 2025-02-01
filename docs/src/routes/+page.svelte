<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<Header stars={data.stars} />