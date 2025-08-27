import { TransactionalBackground } from '@pictaccio/admin-api/database/entities/transactional_background';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ReadWithProductionIdentifierResponse extends BaseResponse {
    public background: TransactionalBackground;
}
