import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import client from '../../main';
import { Character } from '../models';
import Factory from './base-factory';

class CharacterClass extends Factory<Character> {
    constructor() {
        super('neon-bot-players');
    }

    async getFromPlayerId(playerId: string, guildId: string) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'playerId = :playerId AND guildId = :guildId',
            ExpressionAttributeValues: {
                ':playerId': { S: playerId },
                ':guildId': { N: guildId.toString() },
            },
        };
        let result = await this.documentClient.send(new QueryCommand(params));

        if (result.Count === 0) {
            const guild = await client.getClient.guilds.fetch(guildId);
            const guildPlayer = await guild.members.fetch(playerId);

            const charName = guildPlayer.nickname
                ? guildPlayer.nickname.split(' ')[0]
                : guildPlayer.user.username.split(' ')[0];

            const imgUrl = guildPlayer.displayAvatarURL({
                extension: 'png',
                size: 512,
            });

            this.create({
                name: charName,
                xp: 0,
                gold: 0,
                playerId,
                imageUrl: imgUrl,
                guildId: BigInt(guildId),
            });

            result = await this.documentClient.send(new QueryCommand(params));
        }

        const items = result.Items?.map((item) => unmarshall(item));

        return items![0];
    }
}

export default new CharacterClass();
