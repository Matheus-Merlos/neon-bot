import { EntryNotFoundError } from './errors';

function getMostSimilarString(arr: string[], target: string): string {
    if (arr.length === 0) {
        throw new Error('O array não pode ser vazio');
    }

    target = target.toLowerCase().trim();

    function levenshtein(a: string, b: string): number {
        const alen = a.length;
        const blen = b.length;
        const dp = Array.from({ length: alen + 1 }, () => Array(blen + 1).fill(0));

        for (let i = 0; i <= alen; i++) dp[i][0] = i;
        for (let j = 0; j <= blen; j++) dp[0][j] = j;

        for (let i = 1; i <= alen; i++) {
            for (let j = 1; j <= blen; j++) {
                dp[i][j] =
                    a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }

        return dp[alen][blen];
    }

    function normalizedLevenshtein(a: string, b: string): number {
        const distance = levenshtein(a, b);
        return distance / Math.max(a.length, b.length, 1); // Normalização mais rígida
    }

    function cosineSimilarity(a: string, b: string): number {
        const vectorize = (str: string) => {
            const freq: Record<string, number> = {};
            for (const char of str) {
                freq[char] = (freq[char] || 0) + 1;
            }
            return freq;
        };

        const vecA = vectorize(a);
        const vecB = vectorize(b);
        const uniqueChars = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

        let dotProduct = 0,
            magA = 0,
            magB = 0;
        for (const char of uniqueChars) {
            const valA = vecA[char] || 0;
            const valB = vecB[char] || 0;
            dotProduct += valA * valB;
            magA += valA ** 2;
            magB += valB ** 2;
        }

        return magA && magB ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
    }

    function getSimilarity(target: string, candidate: string): number {
        const lev = normalizedLevenshtein(target, candidate);
        const cos = cosineSimilarity(target, candidate);
        return (1 - lev) * 0.6 + cos * 0.4; // Combinação ponderada
    }

    let mostSimilarString = arr[0];
    let bestScore = getSimilarity(target, arr[0].toLowerCase());

    for (let i = 1; i < arr.length; i++) {
        const score = getSimilarity(target, arr[i].toLowerCase());
        if (score > bestScore) {
            bestScore = score;
            mostSimilarString = arr[i];
        }
    }

    if (bestScore < 0.6) {
        // Define um limiar para considerar "parecido"
        throw new EntryNotFoundError('No similar string was found');
    }

    return mostSimilarString;
}

export default getMostSimilarString;
