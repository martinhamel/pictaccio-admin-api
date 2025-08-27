import { Language } from '@pictaccio/admin-api/types/language';

export type ResetPasswordDescriptor = {
    lang: Language,
    resetCode: string,
    userName: string,
    userEmail: string,
}
