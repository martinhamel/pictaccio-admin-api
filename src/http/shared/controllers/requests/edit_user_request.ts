import { IsUUID, ValidateNested } from 'class-validator';
import { ValidateUserInfo } from '../../../../http/shared/controllers/nested/validate_user';

export class EditUserRequest {
    @IsUUID()
    public id: string;

    @ValidateNested()
    public info: ValidateUserInfo;
}
