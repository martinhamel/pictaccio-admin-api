import { IsEmail } from 'class-validator';

export class ResetAuthenticatorRequest {
    @IsEmail()
    public email: string;
}
