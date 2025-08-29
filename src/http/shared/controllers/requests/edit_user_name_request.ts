import { IsString } from 'class-validator';
import { UserName } from '@pictaccio/shared/types/user_name';

export class EditUserNameRequest implements UserName {
    @IsString()
    public firstName: string;

    @IsString()
    public lastName: string;
}
