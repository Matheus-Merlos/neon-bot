import { ChatInputCommandInteraction, Message } from 'discord.js';
import CharacterFactory from '../../factories/character-factory';
import { IStrategy } from '../base-strategy';

type Input = {
    foes: string[];
    playerIds: string[];
};

export default class TurnListStrategy implements IStrategy<Input> {
    async handleInput(
        input: Input,
        replyInstance: ChatInputCommandInteraction | Message<true>,
    ): Promise<void> {
        const charNames: string[] = [];
        for (const playerId of input.playerIds) {
            const char = await CharacterFactory.getFromPlayerId(playerId, replyInstance.guildId!);
            charNames.push(char.name);
        }

        const turns: Array<{ name: string; result: number; isFoe: boolean }> = [];

        input.foes.forEach((foe) => {
            turns.push({
                name: foe,
                result: Math.floor(Math.random() * 20) + 1,
                isFoe: true,
            });
        });

        charNames.forEach((char) => {
            turns.push({
                name: char,
                result: Math.floor(Math.random() * 20) + 1,
                isFoe: false,
            });
        });

        turns.sort((a, b) => b.result - a.result);

        let msg = '```\n---TURNOS---\n\n';

        turns.forEach((turn) => {
            const displayName = turn.isFoe ? `**${turn.name}**` : turn.name;
            msg += `${displayName} - ${turn.result}\n`;
        });

        msg += '```';

        replyInstance.reply(msg);
    }

    async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
        const foesInput = interaction.options.getString('foes') ?? '';
        const foes = foesInput
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f.length > 0);

        const playerIds: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const player = interaction.options.getUser(`player${i}`);
            if (player) playerIds.push(player.id);
        }

        await this.handleInput({ foes, playerIds }, interaction);
    }

    async execute(message: Message<true>, messageAsList: Array<string>): Promise<void> {
        const foes = messageAsList.filter((entry) => !entry.includes('@'));
        const players = messageAsList.filter((entry) => entry.includes('@'));
        const playerIds = players.map((p) => p.replace(/[<@!>]/g, ''));

        await this.handleInput({ foes, playerIds }, message);
    }
}
