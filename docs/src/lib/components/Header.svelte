<script lang="ts">
    import '$lib/styles/components/header.css';

    let { stars }: { stars: string } = $props();
</script>

<header>
    <div id="logo">
        <img src="/bot-logo.png" alt="Neon Bot Logo" />
        <h1>NEON</h1>
    </div>
    <nav>
        <a href="/" class="link">Sobre</a>
        <a href="/commands" class="link">Comandos</a>
        <a href="/invite" class="link">Adicionar</a>
    </nav>
    <a id="github-link" href="https://github.com/Matheus-Merlos/neon-bot">
        <div>
            <img src="/github-icon.png" alt="Github Icon" />
            <p>{stars}☆</p>
        </div>
    </a>
</header>
