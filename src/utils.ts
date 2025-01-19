function getIdFromMention(mention: string): string {
    return mention.slice(2, mention.length - 1);
}

function getMostSimilarString(arr: string[], target: string): string {
    if (arr.length === 0) {
        throw new Error('O array não pode ser vazio');
    }

    target = target.toLowerCase();

    function levenshtein(a: string, b: string): number {
        a = a.toLowerCase();
        b = b.toLowerCase();

        const tmp: number[] = [];
        let i: number, j: number;
        const alen = a.length;
        const blen = b.length;
        if (alen === 0) {
            return blen;
        }
        if (blen === 0) {
            return alen;
        }

        for (i = 0; i <= alen; i++) {
            tmp[i] = i;
        }

        for (j = 0; j <= blen; j++) {
            let lastValue = j;
            for (i = 0; i < alen; i++) {
                const oldValue = tmp[i];
                tmp[i] =
                    a[i] === b[j]
                        ? lastValue
                        : Math.min(lastValue + 1, Math.min(oldValue + 1, tmp[i] + 1));
                lastValue = oldValue;
            }
        }
        return tmp[alen - 1];
    }

    let mostSimilarString = arr[0].toLowerCase();
    let minDistance = levenshtein(target, arr[0]);

    for (let i = 1; i < arr.length; i++) {
        const currentDistance = levenshtein(target, arr[i]);
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            mostSimilarString = arr[i].toLowerCase();
        }
    }

    if (minDistance > target.length / 2) {
        throw new Error('Nenhuma string similar foi encontrada');
    }

    return mostSimilarString;
}

function toSlug(str: string): string {
    //Removes words with diacritics in them
    const noDiacritics = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const noSpace = noDiacritics.replaceAll(' ', '-');
    return noSpace.toLowerCase();
}

export { getIdFromMention, getMostSimilarString, toSlug };
