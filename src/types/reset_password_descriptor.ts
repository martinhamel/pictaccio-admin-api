import { Language } from './language';

export type ResetPasswordDescriptor = {
    lang: Language,
    resetCode: string,
    userName: string,
    userEmail: string,
}
