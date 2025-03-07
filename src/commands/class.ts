import { Colors } from 'discord.js';
import { characterClass } from '../db/schema';
import ClassFactory from '../factories/class-objectives/class-factory';
import { SimpleTableCommand } from './base-command';

export default class Class extends SimpleTableCommand<typeof characterClass, ClassFactory> {
    constructor() {
        super('class', ClassFactory.getInstance(), Colors.Yellow, 'classes');
    }
}
