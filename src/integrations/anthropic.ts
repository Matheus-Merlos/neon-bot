import Anthropic from '@anthropic-ai/sdk';
import { Message, PermissionFlagsBits } from 'discord.js';
import config from '../config';
import {
    buildQuestionSystemPrompt,
    buildSkillApprovalRequest,
    buildSkillApprovalSystemPrompt,
    parseSkillVerdict,
    SkillVerdict,
} from '../config/prompts';
import { CHANNEL_SEARCH_TOOL, searchChannelMessages } from '../config/tools';
import { RuleFactory, SystemFactory } from '../factories';
import { sanitize } from '../utils/sanitize';

// Máximo de rodadas em que o modelo pode chamar ferramentas antes de ser obrigado a responder.
const MAX_TOOL_ROUNDS = 4;

interface DocEntry {
    id: number | string;
    name: string;
    description: string;
}

export interface SkillApprovalResult {
    verdict: SkillVerdict;
    body: string;
}

type ToolRunner = (name: string, input: unknown) => Promise<string>;

// Cada entrada vira um título próprio, para o modelo conseguir citar "Regra 3 - Nome".
function formatEntries(label: string, entries: DocEntry[]): string {
    return entries
        .map(
            (entry) =>
                `### ${label} ${entry.id} - ${sanitize(entry.name)}\n${sanitize(entry.description)}`,
        )
        .join('\n\n');
}

function displayName(message: Message<true>): string {
    return sanitize(message.member?.displayName ?? message.author.username);
}

class AnthropicAgent {
    private readonly anthropic: Anthropic;
    private readonly model: string = config.ANTHROPIC_MODEL;
    private readonly maxTokens: number = config.ANTHROPIC_MAX_TOKENS;

    constructor() {
        this.anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    }

    async systemQuestion(question: string, message: Message<true>): Promise<string> {
        // Ajuste para a sua regra de staff (ex.: checar um ID de cargo específico).
        const isStaff = message.member?.permissions.has(PermissionFlagsBits.ManageGuild) ?? false;
        const responseLimit = isStaff ? 3800 : 1800;

        const request = `<asker>
nome: ${displayName(message)}
cargo: ${isStaff ? 'Staff' : 'Jogador'}
</asker>

<response_limit>${responseLimit}</response_limit>

<question>
${sanitize(question)}
</question>

Responda à pergunta em <question> seguindo suas instruções. Antes de escrever, identifique o tipo de pergunta e localize em <system> e <rules> os trechos que realmente se aplicam; se nenhum se aplicar, diga que o assunto não está coberto em vez de deduzir uma regra. Entregue apenas a mensagem final que será postada no Discord.`;

        const { text } = await this.ask({
            model: this.model,
            systemPrompt: buildQuestionSystemPrompt(message.guild.name),
            documents: await this.buildDocuments(message.guildId),
            request,
        });

        return text || 'Não consegui gerar uma resposta agora. Tente reformular a pergunta.';
    }

    async skillApproval(skill: string, message: Message<true>): Promise<SkillApprovalResult> {
        const { text, truncated } = await this.ask({
            model: this.model,
            systemPrompt: buildSkillApprovalSystemPrompt(message.guild.name),
            documents: await this.buildDocuments(message.guildId),
            request: buildSkillApprovalRequest(sanitize(skill), displayName(message), 1800),
            tools: [CHANNEL_SEARCH_TOOL],
            runTool: async (name, input) => {
                if (name === CHANNEL_SEARCH_TOOL.name) return searchChannelMessages(message, input);
                throw new Error(`Ferramenta desconhecida: ${name}`);
            },
        });

        const { verdict, body } = parseSkillVerdict(text);

        // Resposta cortada ou sem a linha de veredito: nunca conta como aprovação.
        if (truncated || !verdict) {
            console.warn(
                '[AnthropicAgent] Avaliação sem veredito válido ou cortada; encaminhando para a staff.',
            );
            return {
                verdict: 'STAFF',
                body: '### 🛑 Encaminhada para a staff\nNão consegui concluir a avaliação desta habilidade. A staff vai analisá-la.',
            };
        }

        return { verdict, body };
    }

    private async buildDocuments(guildId: string): Promise<string> {
        const [systems, rules] = await Promise.all([
            SystemFactory.getAll(guildId),
            RuleFactory.getAll(guildId),
        ]);

        return `<system>
${formatEntries('Sistema', systems)}
</system>

<rules>
${formatEntries('Regra', rules)}
</rules>`;
    }

    private async ask(params: {
        model: string;
        systemPrompt: string;
        documents: string;
        request: string;
        tools?: Anthropic.Tool[];
        runTool?: ToolRunner;
    }): Promise<{ text: string; truncated: boolean }> {
        const messages: Anthropic.MessageParam[] = [
            {
                role: 'user',
                content: [
                    // Documentos em cache: só são reprocessados quando mudam.
                    { type: 'text', text: params.documents, cache_control: { type: 'ephemeral' } },
                    { type: 'text', text: params.request },
                ],
            },
        ];

        const hasTools = Boolean(params.tools?.length && params.runTool);

        for (let round = 0; ; round++) {
            // Na última rodada permitida, as ferramentas continuam declaradas, mas o modelo
            // é obrigado a responder com o que já tem.
            const toolOptions = hasTools
                ? {
                      tools: params.tools,
                      tool_choice: {
                          type: round < MAX_TOOL_ROUNDS ? 'auto' : 'none',
                      } as Anthropic.ToolChoice,
                  }
                : {};

            const response = await this.anthropic.messages.create({
                model: params.model,
                max_tokens: this.maxTokens,
                thinking: { type: 'adaptive' },
                system: [
                    {
                        type: 'text',
                        text: params.systemPrompt,
                        cache_control: { type: 'ephemeral' },
                    },
                ],
                messages,
                ...toolOptions,
            });

            if (response.stop_reason !== 'tool_use' || !params.runTool) {
                const text = response.content
                    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
                    .map((block) => block.text)
                    .join('\n')
                    .trim();

                return { text, truncated: response.stop_reason === 'max_tokens' };
            }

            // Devolve a resposta inteira (inclusive os blocos de thinking, que a API exige
            // de volta quando há ferramentas) e depois os resultados das ferramentas.
            messages.push({ role: 'assistant', content: response.content });

            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const block of response.content) {
                if (block.type !== 'tool_use') continue;
                try {
                    const content = await params.runTool(block.name, block.input);
                    results.push({ type: 'tool_result', tool_use_id: block.id, content });
                } catch (err) {
                    const reason = err instanceof Error ? err.message : String(err);
                    results.push({
                        type: 'tool_result',
                        tool_use_id: block.id,
                        content: `Erro: ${reason}`,
                        is_error: true,
                    });
                }
            }

            messages.push({ role: 'user', content: results });
        }
    }
}

export default new AnthropicAgent();
