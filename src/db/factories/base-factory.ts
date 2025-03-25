import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Model } from '../models';

export default abstract class Factory<T extends Model> {
    protected readonly client: DynamoDBClient;
    protected readonly documentClient: DynamoDBDocumentClient;

    constructor(protected readonly tableName: string) {
        const necessaryEnvVariables = ['AWS_REGION', 'DB_USER_ACCESS_KEY_ID', 'DB_USER_SECRET_ACCESS_KEY'];
        for (const envVariable of necessaryEnvVariables) {
            if (process.env[envVariable] === undefined) {
                throw new Error(`Could not find env variable "${envVariable}".`);
            }
        }

        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.DB_USER_ACCESS_KEY_ID!,
                secretAccessKey: process.env.DB_USER_SECRET_ACCESS_KEY!,
            },
        });
        this.documentClient = DynamoDBDocumentClient.from(this.client);
    }

    async create(args: T) {
        const params = {
            TableName: this.tableName,
            Item: args,
        };
        await this.documentClient.send(new PutCommand(params));
    }
}
