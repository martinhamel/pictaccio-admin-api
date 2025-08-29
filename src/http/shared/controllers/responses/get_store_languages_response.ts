import { ValidateNested } from 'class-validator';
import { StoreLanguageItem } from '../../../../http/shared/controllers/nested/store_language_item';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetStoreLanguagesResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public languages?: StoreLanguageItem[];
}
