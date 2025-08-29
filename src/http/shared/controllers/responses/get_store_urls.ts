import { IsOptional, IsUrl } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

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
