import { DeleteObjectCommand, ObjectCannedACL, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { randomBytes } from 'crypto';
import { IncomingMessage } from 'http';
import * as sharp from 'sharp';

function toSlug(str: string): string {
    //Removes words with diacritics in them
    const noDiacritics = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const noSpace = noDiacritics.replaceAll(' ', '-');
    return noSpace.toLowerCase();
}

enum BucketDirectories {
    ITEMS_DIR = 'items',
    CHARACTERS_DIR = 'characters',
    MISSIONS_DIR = 'missions',
    MISC_DIR = 'misc',
}

export { BucketDirectories };

class ImageHandler {
    private static instance: ImageHandler | null = null;
    private s3Client: S3Client;
    private env: string;

    constructor() {
        this.env = process.env.ENV!;
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION!,
            maxAttempts: 3,
            requestHandler: new NodeHttpHandler({ connectionTimeout: 5000 }),
            credentials: {
                accessKeyId: process.env.IMAGE_AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.IMAGE_AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    public async uploadImage(
        directory: `${BucketDirectories}`,
        imageName: string,
        stream: IncomingMessage,
    ): Promise<{ salt: string; url: string }> {
        //Generates salt to prevent duplicate image names (which would cause errors)
        const salt = randomBytes(5).toString('hex').substring(0, 5);
        const imagePath = `${directory}/${this.env}/${salt}-${toSlug(imageName)}.png`;

        const pngBuffer = await stream.pipe(sharp()).resize(512, 512, { fit: 'cover' }).png().toBuffer();

        //Uploads the image to a S3 Bucket
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: imagePath,
            Body: pngBuffer,
            ContentType: 'image/png',
            ACL: ObjectCannedACL.public_read,
        };

        const upload = new Upload({
            client: this.s3Client,
            params: uploadParams,
        });

        await upload.done();

        return {
            salt,
            url: `https://${process.env.BUCKET_NAME!}.s3.amazonaws.com/${imagePath}`,
        };
    }

    public async deleteImage(directory: `${BucketDirectories}`, salt: string, imageName: string): Promise<void> {
        const imagePath = `${directory}/${this.env}/${salt}-${toSlug(imageName)}.png`;

        const deleteParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: imagePath,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);

        await this.s3Client.send(deleteCommand);
    }
}

export default new ImageHandler();
