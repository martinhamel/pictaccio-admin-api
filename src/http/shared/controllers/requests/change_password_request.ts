import { Password } from '../../../../http/shared/validators/password';

export class ChangePasswordRequest {
    @Password()
    public secret: string;
}
