import { LockAcquireError } from '@pictaccio/admin-api/errors/lock_acquire_error';
import { DbLockIds, DbLockKey } from '@pictaccio/admin-api/types/locks';
import { QueryRunner } from 'typeorm';

export async function lock(runner: QueryRunner, key: DbLockKey, wait = false): Promise<void> {
    if (wait) {
        await runner.manager.query(`SELECT pg_advisory_xact_lock($1)`, [DbLockIds[key]]);
    } else {
        const result = await runner.manager.query(`SELECT pg_try_advisory_xact_lock($1) as acquired`, [DbLockIds[key]]);

        if (!result[0].acquired) {
            throw new LockAcquireError(`Could not acquire lock for ${key}`);
        }
    }
}
