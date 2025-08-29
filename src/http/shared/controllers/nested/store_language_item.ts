import { IsBoolean, IsInt, IsLocale, IsPositive } from 'class-validator';
import { Language } from '@pictaccio/shared/types/language';

export class StoreLanguageItem {
    @IsInt()
    @IsPositive()
    public order: number;

    @IsBoolean()
    public primary: boolean;

    @IsLocale()
    public locale: Language;
}
