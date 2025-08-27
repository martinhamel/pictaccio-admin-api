import { IsBoolean, ValidateNested } from '@loufa/class-validator';
import { StoreFeatures } from '@pictaccio/admin-api/http/shared/controllers/nested/store_features';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class StoreConfiguredResponse extends BaseResponse {
    @IsBoolean()
    isReady: boolean;

    @ValidateNested()
    features: StoreFeatures;
}
