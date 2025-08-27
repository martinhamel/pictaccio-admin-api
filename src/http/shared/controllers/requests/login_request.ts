import { IsEmail, MinLength, MaxLength } from '@loufa/class-validator';

export class LoginRequest {
    @IsEmail()
    public email: string;

    @MinLength(8)
    @MaxLength(100)
    public secret: string;

    @MinLength(6)
    @MaxLength(6)
    public token: string;
}
