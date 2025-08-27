import { IsEmail, IsUrl, IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ValidateResetPasswordCodeResponse extends BaseResponse {
    @IsUUID()
    public resetToken?: string;
}
