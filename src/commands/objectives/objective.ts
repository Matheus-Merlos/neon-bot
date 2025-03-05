import { Colors, Message } from 'discord.js';
import ObjectiveDifficultyFactory from '../../factories/objectives/objective-difficulty-factory';
import ObjectiveFactory from '../../factories/objectives/objective-factory';
import { CreateObjectiveStrategy, ListStrategy, Strategy } from '../../strategies';
import DefaultStrategy from '../../strategies/generics/default-strategy';
import DeleteStrategy from '../../strategies/generics/delete-strategy';
import InfoStrategy from '../../strategies/generics/info-strategy';
import SelectObjectiveStrategy from '../../strategies/objectives/select-objective-strategy';
import Command from '../base-command';

export default class Objective implements Command {
    async execute(message: Message, messageAsList: Array<string>): Promise<void> {
        const subCommand = messageAsList.splice(0, 1)[0];

        const subCommands: Record<string, Strategy> = {
            create: new CreateObjectiveStrategy(),
            list: new ListStrategy(ObjectiveFactory.getInstance(), 'Objetivos do servidor', Colors.Blurple, async (entry) => {
                const objectiveDifficulty = await ObjectiveDifficultyFactory.getInstance().getFromId(entry.type);

                return [
                    {
                        name: `${entry.name} - ${objectiveDifficulty.name}`,
                        value: `XP: ${entry.xp} | Dinheiro: $${entry.gold}`,
                        inline: false,
                    },
                    {
                        name: ' ',
                        value: ' ',
                        inline: false,
                    },
                ];
            }),
            info: new InfoStrategy(ObjectiveFactory.getInstance()),
            delete: new DeleteStrategy(ObjectiveFactory.getInstance(), 'objetivo'),
            select: new SelectObjectiveStrategy(),
        };

        const strategy: Strategy =
            subCommands[subCommand] ??
            new DefaultStrategy(';objective', [
                {
                    name: 'create',
                    description:
                        'Comando para criar um objetivo, seguindo a sintaxe:\n`<nome_objetivo> <xp> <gold> <dificuldade> <descrição>`',
                },
                {
                    name: 'list',
                    description: 'Listar todos os objetivos do servidor',
                },
                {
                    name: 'info',
                    description: 'Ver sobre um objetivo em específico, com a simples sintaxe:\n`<nome_objetivo>`',
                },
                {
                    name: 'delete',
                    description: 'Deletar um objetivo em específico, com a sintaxe de:\n`<nome_objetivo>`',
                },
            ]);

        //TODO: selected
        //TODO: completed

        await strategy.execute(message as Message<true>, messageAsList);
    }
}
