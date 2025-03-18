import { Colors, PermissionFlagsBits } from 'discord.js';
import { mission } from '../db/schema';
import { HasStrategyPermission } from '../decorators';
import MissionDifficultyFactory from '../factories/missions/mission-difficulty-factory';
import MissionFactory from '../factories/missions/mission-factory';
import {
    CompletedMissionStrategy,
    CreateMissionStrategy,
    DeleteStrategy,
    EditImageStrategy,
    EditStrategy,
    InfoStrategy,
    ListStrategy,
} from '../strategies';
import { StrategyCommand } from './base-command';

export default class Mission extends StrategyCommand {
    constructor() {
        super('mission', {
            create: new HasStrategyPermission(new CreateMissionStrategy(), PermissionFlagsBits.ManageChannels),
            info: new InfoStrategy(MissionFactory.getInstance()),
            list: new ListStrategy(MissionFactory.getInstance(), 'missões', Colors.Fuchsia, async (entry) => {
                const missionDifficulty = await MissionDifficultyFactory.getInstance().getFromId(entry.difficulty);

                return [
                    {
                        name: `${entry.name.toUpperCase()} - ${missionDifficulty.name}`,
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
            delete: new HasStrategyPermission(
                new DeleteStrategy(MissionFactory.getInstance(), 'missão'),
                PermissionFlagsBits.ManageChannels,
            ),
            complete: new HasStrategyPermission(new CompletedMissionStrategy(), PermissionFlagsBits.ManageChannels),
            edit: new EditStrategy({
                image: new HasStrategyPermission(
                    new EditImageStrategy(MissionFactory.getInstance(), mission),
                    PermissionFlagsBits.ManageChannels,
                ),
            }),
        });
    }
}
