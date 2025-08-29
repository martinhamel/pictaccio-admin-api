import { IsLocale } from 'class-validator';
import { Language } from '../../../../types/language';

export class SessionPostLangRequest {
    @IsLocale()
    lang: Language;
}
