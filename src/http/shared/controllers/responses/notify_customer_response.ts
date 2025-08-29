import { IsBoolean, IsOptional } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class NotifyCustomerResponse extends BaseResponse {
    @IsOptional()
    @IsBoolean()
    public updateFound?: boolean;
}
