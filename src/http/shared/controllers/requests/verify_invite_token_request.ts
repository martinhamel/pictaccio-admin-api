import { IsEmail } from '@loufa/class-validator';

export class VerifyInviteTokenRequest {
    @IsEmail()
    public email: string;

    public token: string;
}
