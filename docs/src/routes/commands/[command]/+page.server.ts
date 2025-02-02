import { db } from '$lib/db';
import { command } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const { command: cmd } = params;

    const [commandDetails] = await db.select().from(command).where(eq(command.slug, cmd));

    const htmlMarkdown = await marked(commandDetails.description);

    commandDetails.description = htmlMarkdown;

    return {
        command: commandDetails,
    };
}) satisfies PageServerLoad;
