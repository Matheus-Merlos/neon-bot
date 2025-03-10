import { Colors } from 'discord.js';
import { eq } from 'drizzle-orm';
import db from '../db/db';
import { characterClass } from '../db/schema';
import ClassObjectiveFactory from '../factories/class-objectives/class-objective-factory';
import {
    CompletedClassObjectiveStrategy,
    CreateClassObjectiveStrategy,
    DeleteStrategy,
    ListCompletedClassObjectivesStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class ClassObjective extends StrategyCommand {
    constructor() {
        super('class-objective', {
            create: new CreateClassObjectiveStrategy(),
            delete: new DeleteStrategy(ClassObjectiveFactory.getInstance(), 'objetivo de classe'),
            'list-all': new ListStrategy(
                ClassObjectiveFactory.getInstance(),
                'Objetivos de classe',
                Colors.DarkAqua,
                async (entry) => {
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
                },
            ),
            'list-completed': new ListCompletedClassObjectivesStrategy(),
            completed: new CompletedClassObjectiveStrategy(),
        });
    }
}
