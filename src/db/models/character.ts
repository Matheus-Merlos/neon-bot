import Model from './base-model';

type Character = Model & {
    name: string;
    xp: number;
    gold: number;
    playerId: string;
    imageUrl?: string;
    salt?: string;
};

export default Character;
