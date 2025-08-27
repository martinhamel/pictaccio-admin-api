import { IsEmail, IsUUID } from '@loufa/class-validator';

export class FinishInviteRequest {
    @IsUUID()
    public inviteToken: string;

    @IsEmail()
    public email: string;
}
