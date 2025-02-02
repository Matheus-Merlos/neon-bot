<script lang="ts">
    import { page } from '$app/state';
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData; children: Snippet } = $props();

    let { commands } = data;

    let urlSplit = page.url.pathname.split('/');
    let commandUrl = urlSplit[urlSplit.length - 1];
</script>

<aside>
    {#each commands as cmd}
        <h3>{cmd.familyName}</h3>
        <div>
            {#each cmd.details as command}
                <a
                    class={commandUrl === command.slug ? 'selected-page' : ''}
                    href={`${command.slug}`}>{command.name}</a
                >
            {/each}
        </div>
    {/each}
</aside>
<section>
    {@render children()}
</section>

<style>
    aside {
        display: flex;
        flex-direction: column;

        width: 20vw;
        height: 87.5vh;
        border-right: 1px solid white;

        padding: 1%;
    }

    aside h3 {
        font-family: 'Inter', sans-serif;
        font-weight: 400;
        font-size: 24pt;
        color: var(--white);
    }

    aside div {
        border-left: 1px solid var(--white);
        padding: 3% 0 1% 5%;
    }

    aside a {
        color: var(--darker-white);

        font-family: 'Inter', sans-serif;
        font-weight: 400;
        font-size: 18pt;

        transition: color 0.2s ease-out;
    }

    aside a:hover {
        cursor: pointer;
        color: white;
    }

    .selected-page {
        color: white;
    }
</style>
