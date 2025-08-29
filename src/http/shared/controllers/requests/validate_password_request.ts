import { Password } from '../../../../http/shared/validators/password';

export class ValidatePasswordRequest {
    @Password()
    public secret: string;
}
