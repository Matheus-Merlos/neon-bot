import { Colors } from 'discord.js';
import ClassFactory from '../factories/class-objectives/class-factory';
import { CreateStrategy, DeleteStrategy, ListStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Class extends StrategyCommand {
    constructor() {
        super('class', {
            create: new CreateStrategy(ClassFactory.getInstance(), 'classe'),
            list: new ListStrategy(ClassFactory.getInstance(), 'Classes', Colors.Yellow, (entry) => {
                return [
                    {
                        name: entry.name,
                        value: ' ',
                        inline: false,
                    },
                    {
                        name: ' ',
                        value: ' ',
                        inline: false,
                    },
                ];
            }),
            delete: new DeleteStrategy(ClassFactory.getInstance(), 'classe'),
        });
    }
}
