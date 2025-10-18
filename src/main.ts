import { PermissionFlagsBits } from 'discord.js';
import { config } from 'dotenv';
import Client from './client';
import {
    AddExp,
    AddGold,
    Calculate,
    Character,
    Class,
    ClassObjective,
    ClearChat,
    Image,
    Inventory,
    Item,
    Leaderboard,
    Mission,
    MissionDifficulty,
    NewGen,
    Objective,
    ObjectiveDifficulty,
    Pay,
    RemoveExp,
    RemoveGold,
    Reset,
    Roll,
    StackAddExp,
    StackAddGold,
    TurnList,
} from './commands';
import { default as NPC } from './commands/npc';
import { HasCommandPermission } from './decorators';
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

client.addCommand('add-exp', new HasCommandPermission(new AddExp(), PermissionFlagsBits.ManageGuild));
client.addCommand('remove-exp', new HasCommandPermission(new RemoveExp(), PermissionFlagsBits.ManageGuild));
client.addCommand(['add-gold', 'add-money'], new HasCommandPermission(new AddGold(), PermissionFlagsBits.ManageGuild));
client.addCommand('remove-gold', new HasCommandPermission(new RemoveGold(), PermissionFlagsBits.ManageGuild));
client.addCommand('stack-add-exp', new HasCommandPermission(new StackAddExp(), PermissionFlagsBits.ManageGuild));
client.addCommand('stack-add-gold', new HasCommandPermission(new StackAddGold(), PermissionFlagsBits.ManageGuild));
client.addCommand(['inv', 'inventory', 'profile'], new Inventory());
client.addCommand('leaderboard', new Leaderboard());
client.addCommand(['pay', 'pagar'], new Pay());

client.addCommand(['reset', 'clear'], new HasCommandPermission(new Reset(), PermissionFlagsBits.Administrator));
client.addCommand(['newgen', 'novagen'], new HasCommandPermission(new NewGen(), PermissionFlagsBits.Administrator));

client.addCommand(['turn-list', 'turnos'], new HasCommandPermission(new TurnList(), PermissionFlagsBits.ManageGuild));
client.addCommand(['calc', 'r', 'calculate'], new Calculate());
client.addCommand('roll', new Roll());
client.addCommand(['limpar-chat', 'clear-chat'], new HasCommandPermission(new ClearChat(), PermissionFlagsBits.ManageMessages));

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

export default client;
