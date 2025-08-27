import { IsEmail, IsNumberString, MaxLength, MinLength } from '@loufa/class-validator';

export class ValidateResetPasswordCodeRequest {
    @IsEmail()
    public email: string;

    @MinLength(8)
    @MaxLength(8)
    @IsNumberString()
    public code: string;
}
