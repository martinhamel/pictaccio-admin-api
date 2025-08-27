import { IsUUID, ValidateNested } from '@loufa/class-validator';
import { ValidateUserInfo } from '@pictaccio/admin-api/http/shared/controllers/nested/validate_user';

export class EditUserRequest {
    @IsUUID()
    public id: string;

    @ValidateNested()
    public info: ValidateUserInfo;
}
