import { IsEmail, MaxLength, MinLength } from '@loufa/class-validator';

export class VerifyAuthenticatorRequest {
    @IsEmail()
    public email: string;

    @MinLength(6)
    @MaxLength(6)
    public token: string;
}
