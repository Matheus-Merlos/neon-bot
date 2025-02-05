import { db } from '$lib/db';
import { command, family } from '$lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
    const [firstCommand] = await db
        .select({ slug: command.slug })
        .from(command)
        .innerJoin(family, eq(command.family, family.id))
        .orderBy(asc(family.description), asc(command.name));

    const url = 'https://api.github.com/repos/Matheus-Merlos/neon-bot';

    let stars: string;

    try {
        const response = await fetch(url);
        const data = await response.json();
        stars = data.stargazers_count.toString(); // Converte para string para evitar erros
    } catch {
        stars = 'Error';
    }

    return {
        firstCommandSlug: firstCommand.slug,
        stars,
    };
}) satisfies LayoutServerLoad;
