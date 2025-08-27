import { IsLocale } from '@loufa/class-validator';
import { Language } from '@pictaccio/admin-api/types/language';

export class SessionPostLangRequest {
    @IsLocale()
    lang: Language;
}
