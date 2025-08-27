import { createHash } from 'node:crypto';

export function sha256(value: string): string {
    const hasher = createHash('sha256');

    hasher.update(value);
    return hasher.digest('hex');
}
