import { IsNotEmpty, IsOptional, IsUUID } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class LoginResponse extends BaseResponse {
    @IsOptional()
    @IsUUID()
    public id?: string;

    @IsOptional()
    @IsNotEmpty()
    public token?: string;
}
