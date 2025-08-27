import { ValidateNested } from '@loufa/class-validator';
import { StoreLanguageItem } from '@pictaccio/admin-api/http/shared/controllers/nested/store_language_item';

export class SetStoreLanguagesRequest {
    @ValidateNested({ each: true })
    public languages: StoreLanguageItem[];
}
