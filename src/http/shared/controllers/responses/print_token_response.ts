import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class PrintTokenResponse extends BaseResponse {
    token?: string;
}
