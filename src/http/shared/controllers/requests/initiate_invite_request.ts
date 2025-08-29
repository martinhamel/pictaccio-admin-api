import { IsAlpha, IsEmail, ValidateNested } from 'class-validator';
import { ArrayIncludes } from '../../../../http/shared/validators/array_includes';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../../core/config_schema';
import { UserName } from '@pictaccio/shared/types/user_name';

const config = Container.get<ConfigSchema>('config');

export class ValidateUserName implements UserName {
    @IsAlpha()
    public firstName: string;

    @IsAlpha()
    public lastName: string;
}

export class InitiateInviteRequest {
    @ValidateNested()
    public name: ValidateUserName;

    @IsEmail()
    public email: string;

    @ArrayIncludes(config.roles.list)
    public roles: string[];
}
