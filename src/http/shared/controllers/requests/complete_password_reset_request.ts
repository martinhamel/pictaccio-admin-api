import { IsEmail, IsNumberString, IsUUID, MaxLength, MinLength } from '@loufa/class-validator';
import { Password } from '@pictaccio/admin-api/http/shared/validators/password';

export class CompletePasswordResetRequest {
    @IsEmail()
    public email: string;

    @IsUUID()
    public resetToken: string;

    @MinLength(8)
    @MaxLength(8)
    @IsNumberString()
    public code: string;

    @Password()
    public secret: string;
}
