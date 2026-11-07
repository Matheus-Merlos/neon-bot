import Anthropic from '@anthropic-ai/sdk';
import config from '../config';

class AnthropicAgent {
    private readonly anthropic: Anthropic;
    private readonly model: string = config.ANTHROPIC_MODEL;
    private readonly maxTokens: number = config.ANTHROPIC_MAX_TOKENS;
    constructor() {
        this.anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    }

    analyzeHability(hability: string, systemPrompt: string) {}
}

export default new AnthropicAgent();
