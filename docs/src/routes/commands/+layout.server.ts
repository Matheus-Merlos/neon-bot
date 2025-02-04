import { db } from '$lib/db';
import { command, family } from '$lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

type Command = {
    familyName: string;
    details: Array<{
        name: string;
        slug: string;
    }>;
};

export const load = (async () => {
    const commandFamilies = await db.select().from(family).orderBy(asc(family.description));

    const commands: Array<Command> = [];

    for (const family of commandFamilies) {
        const cmds = await db
            .select({
                name: command.name,
                slug: command.slug,
            })
            .from(command)
            .where(eq(command.family, family.id))
            .orderBy(asc(command.name));

        commands.push({ familyName: family.description, details: cmds });
    }

    return {
        commands,
    };
}) satisfies LayoutServerLoad;
