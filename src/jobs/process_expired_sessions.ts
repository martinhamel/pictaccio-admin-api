import { TransactionalSession } from '@pictaccio/admin-api/database/entities/transactional_session';

export default (async function (): Promise<void> {
    await TransactionalSession.archiveExpiredSessions();
});
