import { IsUrl } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ResetAuthenticatorResponse extends BaseResponse {
    @IsUrl()
    public uri?: string;
}
