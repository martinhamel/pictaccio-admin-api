import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import {
    AppIntegrationConfigurations
} from '@pictaccio/shared/src/types/app_integration_configuration';

export class GetAppIntegrationResponse extends BaseResponse {
    public integrations?: AppIntegrationConfigurations;
}
