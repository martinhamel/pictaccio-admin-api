import { IsEmail, IsUUID } from '@loufa/class-validator';
import { Password } from '@pictaccio/admin-api/http/shared/validators/password';

export class CompleteInviteRequest {
    @IsUUID()
    public inviteToken: string;

    @IsEmail()
    public email: string;

    @Password()
    public secret: string;
}
