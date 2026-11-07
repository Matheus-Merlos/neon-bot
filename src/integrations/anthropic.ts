import Anthropic from '@anthropic-ai/sdk';
import { Message, PermissionFlagsBits } from 'discord.js';
import config from '../config';
import { buildQuestionSystemPrompt } from '../config/prompts';
import { RuleFactory, SystemFactory } from '../factories';
import { sanitize } from '../utils/sanitize';

type DocEntry = {
    id: number | string;
    name: string;
    description: string;
};

function formatEntries(label: string, entries: DocEntry[]): string {
    return entries
        .map(
            (entry) =>
                `### ${label} ${entry.id} - ${sanitize(entry.name)}\n${sanitize(entry.description)}`,
        )
        .join('\n\n');
}

class AnthropicAgent {
    private readonly anthropic: Anthropic;
    private readonly model: string = config.ANTHROPIC_MODEL;
    private readonly maxTokens: number = config.ANTHROPIC_MAX_TOKENS;

    constructor() {
        this.anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    }

    analyzeHability(hability: string, systemPrompt: string) {}

    async systemQuestion(question: string, message: Message<true>): Promise<string> {
        const systemPrompt = buildQuestionSystemPrompt(message.guild.name);

        const [systems, rules] = await Promise.all([
            SystemFactory.getAll(message.guildId),
            RuleFactory.getAll(message.guildId),
        ]);

        const documents = `<system>
${formatEntries('Sistema', systems)}
</system>

<rules>
${formatEntries('Regra', rules)}
</rules>`;

        const isStaff = message.member?.permissions.has(PermissionFlagsBits.ManageGuild) ?? false;

        const responseLimit = isStaff ? 3800 : 1800;

        const request = `<asker>
nome: ${sanitize(message.member?.displayName ?? message.author.username)}
cargo: ${isStaff ? 'Staff' : 'Jogador'}
</asker>

<response_limit>${responseLimit}</response_limit>

<question>
${sanitize(question)}
</question>

Responda à pergunta em <question> seguindo suas instruções. Antes de escrever, identifique o tipo de pergunta e localize em <system> e <rules> os trechos que realmente se aplicam; se nenhum se aplicar, diga que o assunto não está coberto em vez de deduzir uma regra. Entregue apenas a mensagem final que será postada no Discord.`;

        const response = await this.anthropic.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            thinking: { type: 'adaptive' },
            system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: documents, cache_control: { type: 'ephemeral' } },
                        { type: 'text', text: request },
                    ],
                },
            ],
        });

        if (response.stop_reason === 'max_tokens') {
            console.warn(
                '[AnthropicAgent] Resposta cortada por max_tokens; aumente ANTHROPIC_MAX_TOKENS.',
            );
        }

        const text = response.content
            .filter((block): block is Anthropic.TextBlock => block.type === 'text')
            .map((block) => block.text)
            .join('\n')
            .trim();

        return text || 'Não consegui gerar uma resposta agora. Tente reformular a pergunta.';
    }
}

export default new AnthropicAgent();
