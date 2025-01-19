import { DeleteObjectCommand, ObjectCannedACL, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { randomBytes } from 'crypto';

export default class ImageFactory {
    private static instance: ImageFactory | null = null;
    private s3Client: S3Client;
    private env: string;

    private constructor() {
        if (typeof process.env.AWS_ACCESS_KEY_ID === 'undefined') {
            throw new Error(`'AWS_ACCESS_KEY_ID' not found in environment variables`);
        }
        if (typeof process.env.AWS_SECRET_ACCESS_KEY === 'undefined') {
            throw new Error(`'AWS_SECRET_ACCESS_KEY' not found in environment variables`);
        }
        if (typeof process.env.AWS_REGION === 'undefined') {
            throw new Error(`'AWS_REGION' not found in environment variables`);
        }
        if (typeof process.env.BUCKET_NAME === 'undefined') {
            throw new Error(`'BUCKET_NAME' not found in environment variables`);
        }
        if (typeof process.env.ENV === 'undefined') {
            throw new Error(`'ENV' not found in environment variables`);
        }

        this.env = process.env.ENV;
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            maxAttempts: 3,
            requestHandler: new NodeHttpHandler({ connectionTimeout: 5000 }),
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    public static getInstance(): ImageFactory {
        if (ImageFactory.instance === null) {
            ImageFactory.instance = new ImageFactory();
        }

        return ImageFactory.instance;
    }

    public async uploadImage(
        directory: string,
        imageName: string,
        stream: string,
        contentType: string,
        contentLength: number,
    ): Promise<{ salt: string; url: string }> {
        //Generates salt to prevent duplicate image names (which would cause errors)
        const salt = randomBytes(5).toString('hex').substring(0, 5);
        const imagePath = `${directory}/${this.env}/${salt}-${imageName}`;

        //Uploads the image to a S3 Bucket
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: imagePath,
            Body: stream,
            ContentType: contentType,
            ACL: ObjectCannedACL.public_read,
            ContentLength: contentLength,
        };

        const upload = new Upload({
            client: this.s3Client,
            params: uploadParams,
        });

        await upload.done();

        return {
            salt,
            url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imagePath}`,
        };
    }

    public async deleteImage(directory: string, imageName: string): Promise<void> {
        const imagePath = `${directory}/${this.env}/${imageName}`;

        const deleteParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: imagePath,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);

        await this.s3Client.send(deleteCommand);
    }
}
