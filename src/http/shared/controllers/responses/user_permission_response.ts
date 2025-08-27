import { Container } from 'typedi';
import { ConfigSchema } from '@pictaccio/admin-api/core/config_schema';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { ArrayIncludes } from '@pictaccio/admin-api/http/shared/validators/array_includes';

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
