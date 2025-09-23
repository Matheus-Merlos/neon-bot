import { Colors, PermissionFlagsBits } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { characterClass } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import ClassObjectiveFactory from '../factories/class-objectives/class-objective-factory';
import {
    CompletedClassObjectiveStrategy,
    CreateClassObjectiveStrategy,
    DefaultStrategy,
    DeleteStrategy,
    ListCompletedClassObjectivesStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class ClassObjective extends StrategyCommand {
    constructor() {
        super(
            'class-objective',
            {
                create: new HasStrategyPermission(new CreateClassObjectiveStrategy(), PermissionFlagsBits.Administrator),
                delete: new HasStrategyPermission(
                    new DeleteStrategy(ClassObjectiveFactory, 'objetivo de classe'),
                    PermissionFlagsBits.Administrator,
                ),
                'list-all': new ListStrategy(ClassObjectiveFactory, 'Objetivos de classe', Colors.DarkAqua, async (entry) => {
                    const [cls] = await db.select().from(characterClass).where(eq(characterClass.id, entry.classId));
                    return [
                        {
                            name: `${cls.name} - ${entry.name}`,
                            value: `XP: ${entry.xp}; Dinheiro: ${entry.gold}`,
                            inline: false,
                        },
                        {
                            name: '',
                            value: '',
                            inline: false,
                        },
                    ];
                }),
                'list-completed': new ListCompletedClassObjectivesStrategy(),
                completed: new HasStrategyPermission(new CompletedClassObjectiveStrategy(), PermissionFlagsBits.ManageGuild),
            },
            new DefaultStrategy('class-objective', {
                create: 'Cria um novo objetivo de classe.\n`;class-objective create <classe(uma palavra só)> <nome> <xp> <ouro> <descricao>`.',
                delete: 'Deleta um objetivo de classe específico\n`;class-objective delete <nome_objetivo>`.',
                'list-all': 'Mostra todos os objetivos de classe do servidor.',
                'list-completed':
                    'Mostra todos os objetivos de classe completados seu ou da pessoa marcada\n`;class-objective list-completed <@menção(opcional)>`.',
                completed:
                    'Marca um objetivo como concluído, concede as recompensas e mostra no comando "list-completed" que foi completado.\n`;class-objective completed <@menção(opcional)> <nome_objetivo>`',
            }),
        );
    }
}
