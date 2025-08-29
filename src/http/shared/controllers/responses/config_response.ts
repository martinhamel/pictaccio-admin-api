import { ClientConfigSchema } from '@pictaccio/shared/types/client_config_schema';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export interface ConfigResponse extends BaseResponse {
    config: ClientConfigSchema;
}
