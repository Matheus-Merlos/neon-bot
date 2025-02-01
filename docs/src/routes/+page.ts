import type { PageLoad } from './$types';

export const load: PageLoad = (async ({fetch}) => {
    const url = "https://api.github.com/repos/Matheus-Merlos/neon-bot";

    let stars: string;

    try {
        const response = await fetch(url);
        const data = await response.json();
        stars = data.stargazers_count.toString(); // Converte para string para evitar erros
    } catch {
        stars = "Error";
    }
    return {
        stars
    };
}) satisfies PageLoad;