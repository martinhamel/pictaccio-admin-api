import { IsBoolean, IsInt, IsLocale, IsPositive } from '@loufa/class-validator';
import { Language } from '@pictaccio/shared/src/types/language';

export class StoreLanguageItem {
    @IsInt()
    @IsPositive()
    public order: number;

    @IsBoolean()
    public primary: boolean;

    @IsLocale()
    public locale: Language;
}
