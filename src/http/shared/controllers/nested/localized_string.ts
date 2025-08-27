import { IsString } from '@loufa/class-validator';
import { LocalizedString as LocalizedStringType } from '@pictaccio/admin-api/types/localized_string';

export class LocalizedString implements LocalizedStringType {
    @IsString()
    en?: string;

    @IsString()
    fr?: string;
}
