import { IsEmail } from '@loufa/class-validator';

export class InitiatePasswordResetRequest {
    @IsEmail()
    public email: string;
}
