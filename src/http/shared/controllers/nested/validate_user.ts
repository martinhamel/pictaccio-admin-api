import { IsDate, IsEmail, ValidateNested } from '@loufa/class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { ValidateUserName } from '@pictaccio/admin-api/http/shared/controllers/nested/validate_user_name';
import { ArrayIncludes } from '@pictaccio/admin-api/http/shared/validators/array_includes';
import { User } from '@pictaccio/shared/src/types/user';

const config = Container.get<ConfigSchema>('config');

export class ValidateUserInfo implements User {
    @IsEmail()
    public email?: string;

    @ValidateNested()
    public name?: ValidateUserName;

    @ArrayIncludes(config.roles.list)
    public roles?: string[];
}
