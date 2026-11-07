export default function getTitleAndDescriptionFromStringAsArray(stringAsArray: Array<String>): {
    title: string;
    rest: string;
} | null {
    const text = stringAsArray.join(' ');

    const match = text.match(/["“]([^"”]*)["”]\s*([\s\S]*)/);
    if (!match) return null;

    return {
        title: match[1].trim(),
        rest: match[2].trim(),
    };
}
