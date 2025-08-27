import { AdminInvite } from '@pictaccio/admin-api/database/entities/admin_invite';

export default (async function (): Promise<void> {
    await AdminInvite.deleteExpired();
});
