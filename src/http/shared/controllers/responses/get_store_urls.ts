import { IsOptional, IsUrl } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetStoreUrls extends BaseResponse {
    @IsOptional()
    @IsUrl()
    public contactUrl: string;

    @IsOptional()
    @IsUrl()
    public legalUrl: string;

    @IsOptional()
    @IsUrl()
    public termsAndConditionUrl: string;
}
