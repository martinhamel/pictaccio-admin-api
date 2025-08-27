import { IsAlpha } from '@loufa/class-validator';
import { UserName } from '@pictaccio/shared/src/types/user_name';

export class ValidateUserName implements UserName {
    @IsAlpha()
    public firstName: string;

    @IsAlpha()
    public lastName: string;
}
