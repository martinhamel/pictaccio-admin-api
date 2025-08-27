import { IsEmail } from '@loufa/class-validator';

export class ResetAuthenticatorRequest {
    @IsEmail()
    public email: string;
}
