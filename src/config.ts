import { z } from 'zod';

const envSchema = z.object({
    ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is missing'),
    ANTHROPIC_MODEL: z.string().default('claude-sonnet-5'),
    ANTHROPIC_MAX_TOKENS: z.coerce.number().default(1024),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
    const result = envSchema.safeParse(env);
    if (!result.success) {
        console.error(
            'Invalid environment configuration:',
            JSON.stringify(z.treeifyError(result.error), null, 2),
        );
        process.exit(1);
    }
    return result.data;
}

export default loadConfig();
