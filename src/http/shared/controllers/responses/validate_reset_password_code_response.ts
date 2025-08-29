import { IsEmail, IsUrl, IsUUID } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class ValidateResetPasswordCodeResponse extends BaseResponse {
    @IsUUID()
    public resetToken?: string;
}
