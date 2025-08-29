import { IsNotEmpty, IsEmail } from 'class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../../core/config_schema';
import { ArrayIncludes } from '../../../../http/shared/validators/array_includes';
import { Password } from '../../../../http/shared/validators/password';

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
