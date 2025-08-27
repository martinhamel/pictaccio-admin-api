import { IsBoolean, IsOptional } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class NotifyCustomerResponse extends BaseResponse {
    @IsOptional()
    @IsBoolean()
    public updateFound?: boolean;
}
