import { Language } from './language';

export type InviteDescriptor = {
    lang: Language,
    inviteLink: string,
    inviterName: string,
    inviteeName: string,
    inviteeEmail: string,
}
