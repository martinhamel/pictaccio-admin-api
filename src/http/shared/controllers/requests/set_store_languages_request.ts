import { ValidateNested } from 'class-validator';
import { StoreLanguageItem } from '../../../../http/shared/controllers/nested/store_language_item';

export class SetStoreLanguagesRequest {
    @ValidateNested({ each: true })
    public languages: StoreLanguageItem[];
}
