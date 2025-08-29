import { IsString } from 'class-validator';
import { LocalizedString as LocalizedStringType } from '../../../../types/localized_string';

export class LocalizedString implements LocalizedStringType {
    @IsString()
    en?: string;

    @IsString()
    fr?: string;
}
