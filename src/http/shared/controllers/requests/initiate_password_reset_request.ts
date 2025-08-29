import { IsEmail } from 'class-validator';

export class InitiatePasswordResetRequest {
    @IsEmail()
    public email: string;
}
