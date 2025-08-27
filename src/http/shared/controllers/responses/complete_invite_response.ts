import { IsUrl, IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class CompleteInviteResponse extends BaseResponse {
    @IsUUID()
    public id?: string;

    @IsUrl()
    public otpUri?: string;
}
