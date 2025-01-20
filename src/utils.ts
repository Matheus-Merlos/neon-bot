function getIdFromMention(mention: string): string {
    return mention.slice(2, mention.length - 1);
}

function getMostSimilarString(arr: string[], target: string): string {
    if (arr.length === 0) {
        throw new Error('O array não pode ser vazio');
    }

    target = target.toLowerCase();

    function levenshtein(a: string, b: string): number {
        const alen = a.length;
        const blen = b.length;
        const dp = Array.from({ length: alen + 1 }, () => Array(blen + 1).fill(0));

        for (let i = 0; i <= alen; i++) dp[i][0] = i;
        for (let j = 0; j <= blen; j++) dp[0][j] = j;

        for (let i = 1; i <= alen; i++) {
            for (let j = 1; j <= blen; j++) {
                dp[i][j] =
                    a[i - 1] === b[j - 1]
                        ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }

        return dp[alen][blen];
    }

    function normalizedLevenshtein(a: string, b: string): number {
        const distance = levenshtein(a, b);
        const maxLength = Math.max(a.length, b.length);
        return distance / maxLength;
    }

    function getTokenSimilarity(target: string, candidate: string): number {
        const targetTokens = target.split(' ');
        const candidateTokens = candidate.split(' ');
        let totalScore = 0;

        for (const tToken of targetTokens) {
            let bestScore = 1; // Inicia com o pior caso (similaridade máxima)
            for (const cToken of candidateTokens) {
                const similarity = normalizedLevenshtein(tToken, cToken);
                if (similarity < bestScore) {
                    bestScore = similarity; // Busca a melhor similaridade com o token atual
                }
            }
            totalScore += bestScore;
        }

        return totalScore / targetTokens.length; // Média da similaridade
    }

    let mostSimilarString = arr[0];
    let bestScore = getTokenSimilarity(target, arr[0].toLowerCase());

    for (let i = 1; i < arr.length; i++) {
        const score = getTokenSimilarity(target, arr[i].toLowerCase());
        if (score < bestScore) {
            bestScore = score;
            mostSimilarString = arr[i];
        }
    }

    // Ajuste do limite: quanto menor o score, mais similar
    if (bestScore > 0.5) {
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
