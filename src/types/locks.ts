export const DbLockIds: Record<DbLockKey, number> = {
    backgroundStats: 1,
    salesStats: 2
} as const;

export type DbLocksId = typeof DbLockIds[keyof typeof DbLockIds];

export const DbLockKeys = [
    'backgroundStats',
    'salesStats'
] as const;

export type DbLockKey = typeof DbLockKeys[number];
