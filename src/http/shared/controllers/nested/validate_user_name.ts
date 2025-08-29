import { IsAlpha } from 'class-validator';
import { UserName } from '@pictaccio/shared/types/user_name';

export class ValidateUserName implements UserName {
    @IsAlpha()
    public firstName: string;

    @IsAlpha()
    public lastName: string;
}
