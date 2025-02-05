import { db } from '$lib/db';
import { command, family } from '$lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    const [firstCommand] = await db
        .select({ slug: command.slug })
        .from(command)
        .innerJoin(family, eq(command.family, family.id))
        .orderBy(asc(family.description), asc(command.name));

    return {
        firstCommandSlug: firstCommand.slug,
    };
}) satisfies PageServerLoad;
