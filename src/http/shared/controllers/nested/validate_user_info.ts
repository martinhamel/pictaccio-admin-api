import { ValidateNested } from '@loufa/class-validator';
import { ValidateUserName } from '@pictaccio/admin-api/http/shared/controllers/nested/validate_user_name';
import { UserInfo } from '@pictaccio/shared/src/types/user_info';

export class ValidateUserInfo implements UserInfo {
    @ValidateNested()
    public name: ValidateUserName;
}
