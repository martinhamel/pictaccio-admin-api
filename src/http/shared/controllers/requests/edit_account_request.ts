import { IsEmail, IsUUID, ValidateNested } from 'class-validator';
import { Container } from 'typedi';
import { ValidateUserName } from '../../../../http/shared/controllers/nested/validate_user_name';
import { ArrayIncludes } from '../../../../http/shared/validators/array_includes';
import { ConfigSchema } from '../../../../core/config_schema';

const config = Container.get<ConfigSchema>('config');

export class EditAccountRequest {
    @IsUUID()
    public id: string;

    @ValidateNested()
    public name?: ValidateUserName;

    @IsEmail()
    public email: string;

    @ArrayIncludes(config.roles.list)
    public roles?: string[];
}
