import { IsEmail, IsUUID } from 'class-validator';

export class FinishInviteRequest {
    @IsUUID()
    public inviteToken: string;

    @IsEmail()
    public email: string;
}
