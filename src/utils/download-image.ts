import axios from 'axios';

export default async function downloadImage(
    url: string,
): Promise<{ contentType: string; contentLenght: number; stream: string }> {
    const response = await axios.get(url, { responseType: 'stream' });

    return {
        stream: response.data,
        contentLenght: response.headers['content-length'],
        contentType: response.headers['content-type'],
    };
}
