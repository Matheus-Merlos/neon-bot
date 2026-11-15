import { PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';
import Client from './client';
import {
    Calculate,
    Character,
    Class,
    ClassObjective,
    ClearChat,
    Exp,
    Gold,
    Image,
    Inventory,
    Item,
    Leaderboard,
    Mana,
    Mission,
    MissionDifficulty,
    NewGen,
    NPC,
    Objective,
    ObjectiveDifficulty,
    Reset,
    Roll,
    Rule,
    System,
    TurnList,
} from './commands';
import Approval from './commands/approve';
import Question from './commands/question';
import { HasCommandPermission } from './decorators';
import item from './commands/slash/item';
import approve from './commands/slash/approve';
import calculate from './commands/slash/calculate';
import character from './commands/slash/character';
import classObjective from './commands/slash/class-objective';
import classCmd from './commands/slash/class';
import clearChat from './commands/slash/clear-chat';
import gold from './commands/slash/gold';
import img from './commands/slash/img';
import inventory from './commands/slash/inventory';
import leaderboard from './commands/slash/leaderboard';
import mana from './commands/slash/mana';
import missionDifficulty from './commands/slash/mission-difficulty';
import mission from './commands/slash/mission';
import npc from './commands/slash/npc';
import objectiveDifficulty from './commands/slash/objective-difficulty';
import objective from './commands/slash/objective';
import question from './commands/slash/question';
import roll from './commands/slash/roll';
import rule from './commands/slash/rule';
import system from './commands/slash/system';
import turnList from './commands/slash/turn-list';
import xp from './commands/slash/xp';
config();

const client = new Client({
    prefix: process.env.PREFIX ?? ';',
    requiredEnvironmentVars: [
        'DISCORD_TOKEN',
        'ENV',
        'IMAGE_AWS_ACCESS_KEY_ID',
        'IMAGE_AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'BUCKET_NAME',
        'GOOGLE_API_KEY',
        'SEARCH_ENGINE_ID',
        'DATABASE_HOST',
        'DATABASE_USER',
        'DATABASE_PASSWORD',
        'DATABASE',
    ],
});

client.addCommand(['inv', 'inventory', 'profile'], new Inventory());
client.addCommand('leaderboard', new Leaderboard());

client.addCommand(
    ['reset', 'clear'],
    new HasCommandPermission(new Reset(), PermissionFlagsBits.Administrator),
);
client.addCommand(
    ['newgen', 'novagen'],
    new HasCommandPermission(new NewGen(), PermissionFlagsBits.Administrator),
);

client.addCommand(
    ['turn-list', 'turnos'],
    new HasCommandPermission(new TurnList(), PermissionFlagsBits.ManageGuild),
);
client.addCommand(['calc', 'r', 'calculate'], new Calculate());
client.addCommand('roll', new Roll());
client.addCommand(
    ['limpar-chat', 'clear-chat'],
    new HasCommandPermission(new ClearChat(), PermissionFlagsBits.ManageMessages),
);

client.addCommand('objective', new Objective());
client.addCommand('objective-difficulty', new ObjectiveDifficulty());

client.addCommand('mission', new Mission());
client.addCommand('mission-difficulty', new MissionDifficulty());

client.addCommand('class', new Class());

client.addCommand('item', new Item());

client.addCommand('class-objective', new ClassObjective());

client.addCommand('character', new Character());

client.addCommand('img', new Image());

client.addCommand('npc', new NPC());

client.addCommand('gold', new Gold());
client.addCommand(['exp', 'xp'], new Exp());

client.addCommand('mana', new Mana());

client.addCommand('rule', new Rule());
client.addCommand('system', new System());
client.addCommand('question', new Question());
client.addCommand(['approve-skill', 'approve'], new Approval());

client.registerSlashCommands([
    item,
    approve,
    calculate,
    character,
    classObjective,
    classCmd,
    clearChat,
    gold,
    img,
    inventory,
    leaderboard,
    mana,
    missionDifficulty,
    mission,
    npc,
    objectiveDifficulty,
    objective,
    question,
    roll,
    rule,
    system,
    turnList,
    xp,
]);

export default client;
