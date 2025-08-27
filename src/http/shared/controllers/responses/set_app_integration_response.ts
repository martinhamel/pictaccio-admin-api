import { PublicAppIntegration } from '@pictaccio/admin-api/database/entities/public_app_integration';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class SetAppIntegrationResponse extends BaseResponse {
    public appIntegration: PublicAppIntegration[];
}
