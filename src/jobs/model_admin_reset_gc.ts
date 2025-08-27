import { AdminResetRequest } from '@pictaccio/admin-api/database/entities/admin_reset_request';

export default (async function (): Promise<void> {
    await AdminResetRequest.deleteExpired();
});
