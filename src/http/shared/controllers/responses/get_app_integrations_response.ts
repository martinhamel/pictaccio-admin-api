import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import {
    AppIntegrationConfigurations
} from '@pictaccio/shared/types/app_integration_configuration';

export class GetAppIntegrationResponse extends BaseResponse {
    public integrations?: AppIntegrationConfigurations;
}
