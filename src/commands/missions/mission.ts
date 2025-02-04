import MissionFactory from '../../factories/missions/mission-factory';
import { InfoCommand } from '../base-command';

export default class Mission extends InfoCommand {
    constructor() {
        super(MissionFactory.getInstance(), 'missão', true);
    }
}
