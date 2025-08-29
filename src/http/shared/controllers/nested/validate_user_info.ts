import { ValidateNested } from 'class-validator';
import { ValidateUserName } from '../../../../http/shared/controllers/nested/validate_user_name';
import { UserInfo } from '@pictaccio/shared/types/user_info';

export class ValidateUserInfo implements UserInfo {
    @ValidateNested()
    public name: ValidateUserName;
}
