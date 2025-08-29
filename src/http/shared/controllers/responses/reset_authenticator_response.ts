import { IsUrl } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class ResetAuthenticatorResponse extends BaseResponse {
    @IsUrl()
    public uri?: string;
}
