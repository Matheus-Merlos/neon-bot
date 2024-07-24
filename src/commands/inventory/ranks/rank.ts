import { eq, ilike } from 'drizzle-orm';
import db from '../../../models/db';
import { rank } from '../../../models/schema';
import { Element } from '../../element';

export class Rank implements Element {
    private readonly rankId: number;
    private readonly rankName: string;
    private readonly rankExp: number;
    private readonly rankRoleId: bigint;

    constructor(id: number, name: string, exp: number, roleId: bigint) {
        this.rankId = id;
        this.rankName = name;
        this.rankExp = exp;
        this.rankRoleId = roleId;
    }

    get name() {
        return this.rankName;
    }

    get necessaryXp() {
        return this.rankExp;
    }

    public async update(): Promise<void> {
        await db.update(rank).set({
            descricao: this.rankName,
            necessaryXp: this.rankExp,
            roleId: this.rankRoleId,
        });
    }
}

export class RankFactory {
    public static async retrieveByName(name: string): Promise<Rank> {
        const ranks = await db
            .select({
                id: rank.id,
                name: rank.descricao,
                exp: rank.necessaryXp,
                roleId: rank.roleId,
            })
            .from(rank)
            .where(ilike(rank.descricao, `%${name}%`));

        if (!ranks) {
            throw new Error('Rank not found with this name');
        }
        const { id, name: rankName, exp, roleId } = ranks[0];

        return new Rank(id, rankName, exp, roleId);
    }

    public static async createRank(name: string, exp: number, roleId: bigint): Promise<Rank> {
        await db.insert(rank).values({
            descricao: name,
            necessaryXp: exp,
            roleId: roleId,
        });

        const ranks = await db
            .select({
                id: rank.id,
            })
            .from(rank)
            .where(eq(rank.roleId, roleId));

        const rankDb = ranks[0];
        const { id } = rankDb;

        return new Rank(id, name, exp, roleId);
    }
}
