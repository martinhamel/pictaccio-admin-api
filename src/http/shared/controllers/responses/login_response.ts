import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class LoginResponse extends BaseResponse {
    @IsOptional()
    @IsUUID()
    public id?: string;

    @IsOptional()
    @IsNotEmpty()
    public token?: string;
}
