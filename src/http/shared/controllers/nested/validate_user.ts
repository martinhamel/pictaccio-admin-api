import { IsDate, IsEmail, ValidateNested } from 'class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../../core/config_schema';
import { ValidateUserName } from '../../../../http/shared/controllers/nested/validate_user_name';
import { ArrayIncludes } from '../../../../http/shared/validators/array_includes';
import { User } from '@pictaccio/shared/types/user';

const config = Container.get<ConfigSchema>('config');

export class ValidateUserInfo implements User {
    @IsEmail()
    public email?: string;

    @ValidateNested()
    public name?: ValidateUserName;

    @ArrayIncludes(config.roles.list)
    public roles?: string[];
}
