import { IsString } from '@loufa/class-validator';
import { UserName } from '@pictaccio/shared/src/types/user_name';

export class EditUserNameRequest implements UserName {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;
}
