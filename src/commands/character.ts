import { PermissionFlagsBits } from 'discord.js';
import { character } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import { CharacterFactory } from '../factories';
import { EditImageStrategy, EditStrategy } from '../strategies';
import { StrategyCommand } from './base-command';

export default class Character extends StrategyCommand {
    constructor() {
        super('character', {
            edit: new EditStrategy({
                image: new HasStrategyPermission(
                    new EditImageStrategy(CharacterFactory.getInstance(), character),
                    PermissionFlagsBits.Administrator,
                ),
            }),
        });
    }
}
