import { IsNotEmpty, IsEmail } from '@loufa/class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { ArrayIncludes } from '@pictaccio/admin-api/http/shared/validators/array_includes';
import { Password } from '@pictaccio/admin-api/http/shared/validators/password';

const config = Container.get<ConfigSchema>('config');

export class CreateAccountRequest {
    @IsNotEmpty()
    @IsEmail()
    public email: string;

    @Password()
    public secret: string;

    @ArrayIncludes(config.roles.list)
    public roles: string[];
}
