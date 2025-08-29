import { Session as ExpressSession } from 'express-session';
import { Language } from './language';

export interface UserSession extends ExpressSession {
    lang: Language;
    seed: string;
}
