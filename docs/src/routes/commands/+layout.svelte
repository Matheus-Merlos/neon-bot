<script lang="ts">
    import { page } from '$app/state';
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData; children: Snippet } = $props();

    let { commands } = data;

    let urlSplit = page.url.pathname.split('/');
    let commandUrl = urlSplit[urlSplit.length - 1];
</script>

<section id="main-page">
    <aside>
        {#each commands as cmd}
            <h3>{cmd.familyName}</h3>
            <div>
                {#each cmd.details as command}
                    <a
                        class={commandUrl === command.slug ? 'selected-page' : ''}
                        href={`${command.slug}`}
                        data-sveltekit-reload>{command.name}</a
                    >
                {/each}
            </div>
        {/each}
    </aside>
    <section id="content">
        {@render children()}
    </section>
</section>

<style>
    #main-page {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }

    #content {
        padding: 2.5%;
    }

    aside {
        width: 25vw;
        height: 87.5vh;
        border-right: 1px solid white;

        padding: 1%;
        margin-right: 1%;

        overflow: scroll;
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

        display: flex;
        flex-direction: column;
    }

    aside a {
        color: var(--darker-white);

        font-family: 'Inter', sans-serif;
        font-weight: 400;
        font-size: 18pt;

        transition: color 0.2s ease-out;

        margin-bottom: 4%;
    }

    aside a:hover {
        cursor: pointer;
        color: white;
    }

    .selected-page {
        color: white;
    }
</style>
