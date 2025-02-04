function toSlug(str: string): string {
    //Removes words with diacritics in them
    const noDiacritics = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const noSpace = noDiacritics.replaceAll(' ', '-');
    return noSpace.toLowerCase();
}

export default toSlug;
