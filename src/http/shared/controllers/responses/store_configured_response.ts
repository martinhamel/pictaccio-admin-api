import { IsBoolean, ValidateNested } from 'class-validator';
import { StoreFeatures } from '../../../../http/shared/controllers/nested/store_features';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class StoreConfiguredResponse extends BaseResponse {
    @IsBoolean()
    isReady: boolean;

    @ValidateNested()
    features: StoreFeatures;
}
