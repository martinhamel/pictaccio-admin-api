import { IsAlpha, IsEmail, ValidateNested } from '@loufa/class-validator';
import { ArrayIncludes } from '@pictaccio/admin-api/http/shared/validators/array_includes';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { UserName } from '@pictaccio/shared/src/types/user_name';

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
