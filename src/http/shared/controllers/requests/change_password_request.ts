import { Password } from '@pictaccio/admin-api/http/shared/validators/password';

export class ChangePasswordRequest {
    @Password()
    public secret: string;
}
