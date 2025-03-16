import { Colors, PermissionFlagsBits } from 'discord.js';
import { characterClass } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import ClassFactory from '../factories/class-objectives/class-factory';
import { SetClassStrategy } from '../strategies';
import { SimpleTableCommand } from './base-command';

export default class Class extends SimpleTableCommand<typeof characterClass, ClassFactory> {
    constructor() {
        super('class', ClassFactory.getInstance(), Colors.Yellow, 'classes', {
            set: new HasStrategyPermission(new SetClassStrategy(), PermissionFlagsBits.ManageGuild),
        });
    }
}
