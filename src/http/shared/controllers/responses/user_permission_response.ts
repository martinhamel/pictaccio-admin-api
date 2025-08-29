import { Container } from 'typedi';
import { ConfigSchema } from '../../../../core/config_schema';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { ArrayIncludes } from '../../../../http/shared/validators/array_includes';

const config = Container.get<ConfigSchema>('config');

export class UserPermissionResponse extends BaseResponse {
    @ArrayIncludes(config.roles.list)
    public roles: string[];

    public capabilities: {
        [key: string]: {
            [key: string]: string[]
        }
    };
}
