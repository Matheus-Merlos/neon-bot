import { Colors } from 'discord.js';
import { characterClass } from '../../db/schema';
import ClassFactory from '../../factories/class-objectives/class-factory';
import { ListCommand } from '../base-command';

export default class Objectives extends ListCommand<typeof characterClass> {
    constructor() {
        super(ClassFactory.getInstance(), 'Classes do servidor', Colors.Blue, (entry) => {
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
        });
    }
}
