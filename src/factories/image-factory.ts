import { ObjectCannedACL, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { randomBytes } from 'crypto';

export default class ImageFactory {
    public static async uploadImage(imageName: string, stream: string, contentType: string) {
        imageName = `items/${randomBytes(5).toString('base64').substring(0, 5).replaceAll('/', '-').replaceAll('+', '')}-${imageName}`;

        const s3Client = new S3Client({ region: process.env.AWS_REGION! });

        const body = typeof stream === 'string' ? Buffer.from(stream) : stream;

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: imageName,
            Body: body,
            ContentType: contentType,
            ACL: ObjectCannedACL.public_read,
        };

        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        await upload.done();

        return `https://${process.env.BUCKET_NAME!}.s3.amazonaws.com/${imageName}`;
    }
}
