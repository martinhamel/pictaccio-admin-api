import { PublicAppIntegration } from '../../../../database/entities/public_app_integration';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class SetAppIntegrationResponse extends BaseResponse {
    public appIntegration: PublicAppIntegration[];
}
