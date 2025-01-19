import { ObjectCannedACL, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { randomBytes } from 'crypto';

export default class ImageFactory {
    public static async uploadImage(
        directory: string,
        imageName: string,
        stream: string,
        contentType: string,
        contentLength: number,
    ): Promise<string> {
        if (typeof process.env.AWS_REGION === 'undefined') {
            throw new Error(`'AWS_REGION' not found in environment variables`);
        }
        if (typeof process.env.BUCKET_NAME === 'undefined') {
            throw new Error(`'BUCKET_NAME' not found in environment variables`);
        }

        //Generates salt to prevent duplicate image names (which would cause errors)
        const salt = randomBytes(5).toString('hex').substring(0, 5);
        const imagePath = `${directory}/${salt}-${imageName}`;

        //Uploads the image to a S3 Bucket
        const s3Client = new S3Client({
            region: process.env.AWS_REGION,
            maxAttempts: 3,
            requestHandler: new NodeHttpHandler({ connectionTimeout: 5000 }),
        });

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: imagePath,
            Body: stream,
            ContentType: contentType,
            ACL: ObjectCannedACL.public_read,
            ContentLength: contentLength,
        };

        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        await upload.done();

        return `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imagePath}`;
    }
}
