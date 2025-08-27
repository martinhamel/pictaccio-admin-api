import { Language } from '@pictaccio/admin-api/types/language';

export type InviteDescriptor = {
    lang: Language,
    inviteLink: string,
    inviterName: string,
    inviteeName: string,
    inviteeEmail: string,
}
