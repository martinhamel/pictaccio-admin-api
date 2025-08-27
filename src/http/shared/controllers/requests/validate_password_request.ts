import { Password } from '@pictaccio/admin-api/http/shared/validators/password';

export class ValidatePasswordRequest {
    @Password()
    public secret: string;
}
