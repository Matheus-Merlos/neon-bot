function getIdFromMention(mention: string): string {
    return mention.slice(2, mention.length - 1);
}

export default getIdFromMention;
