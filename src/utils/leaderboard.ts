import CharacterFactory from '../factories/character-factory';

export default async function getLeaderboardPlacement(guildId: string, playerId: string, stat: 'gold' | 'xp'): Promise<number> {
    const characters = await CharacterFactory.getInstance().getAll(guildId);
    characters.sort((a, b) => b[stat] - a[stat]);
    let char = await CharacterFactory.getInstance().getFromPlayerId(playerId, guildId);

    char = characters.find((chr) => chr.id === char.id)!;

    return characters.indexOf(char) + 1;
}
