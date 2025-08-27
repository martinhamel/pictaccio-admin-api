import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetAvailableLanguagesResponse extends BaseResponse {
    public languages?: string[];
}
