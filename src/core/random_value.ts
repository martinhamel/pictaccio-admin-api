import { randomInt } from 'node:crypto';

export async function randomValue(max: number, min = 0): Promise<number> {
    return new Promise((resolve, _) => {
        randomInt(min, max, (error, value: number) => {
            resolve(value);
        });
    });
}