export function sanitize(text: string): string {
    return text.replace(/<\/?\s*(system|rules|question|asker|response_limit)\s*>/gi, (m) =>
        m.replace(/</g, '‹').replace(/>/g, '›'),
    );
}
