import { TransactionalBackground } from '../../../../database/entities/transactional_background';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class ReadWithProductionIdentifierResponse extends BaseResponse {
    public background: TransactionalBackground;
}
