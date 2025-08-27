import { ValidateNested } from '@loufa/class-validator';
import { StoreLanguageItem } from '@pictaccio/admin-api/http/shared/controllers/nested/store_language_item';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetStoreLanguagesResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public languages?: StoreLanguageItem[];
}
