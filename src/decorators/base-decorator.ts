import { Message, PermissionsBitField } from 'discord.js';
import { Command } from '../commands';
import { Strategy } from '../strategies';

abstract class StrategyDecorator implements Strategy {
    constructor(protected readonly strategy: Strategy) {}

    abstract execute(message: Message<true>, messageAsList: Array<string>): Promise<void>;
}

abstract class CommandDecorator implements Command {
    constructor(protected readonly command: Command) {}

    abstract execute(message: Message<true>, messageAsList: Array<string>): Promise<void>;
}

function getPermissionName(permission: bigint): string {
    for (const [perm, value] of Object.entries(PermissionsBitField.Flags as Record<string, bigint>)) {
        if (value === permission) {
            return perm;
        }
    }
    return 'UnknownPermission';
}

export { CommandDecorator, getPermissionName, StrategyDecorator };
