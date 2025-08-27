import { Session as ExpressSession } from 'express-session';
import { Language } from '@pictaccio/admin-api/types/language';

export interface UserSession extends ExpressSession {
    lang: Language;
    seed: string;
}
