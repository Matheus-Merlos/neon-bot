<script lang="ts">
    import "$lib/styles/components/header.css";
    export let stars: string;
</script>

<header>
    <div id="logo">
        <img src="/bot-logo.png" alt="Neon Bot Logo">
        <h1>NEON</h1>
    </div>
    <nav>
        <a href="/">Sobre</a>
        <a href="/">Comandos</a>
        <a href="/">Adicionar</a>
    </nav>
    <div id="github-link">
        <div>
            <img src="/github-icon.png" alt="Github Icon">
            <p>{stars}</p>
        </div>
    </div>
</header>