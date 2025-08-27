import { ClientConfigSchema } from '@pictaccio/shared/src/types/client_config_schema';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export interface ConfigResponse extends BaseResponse {
    config: ClientConfigSchema;
}
