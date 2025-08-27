import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class ValidatePasswordResponse extends BaseResponse {
    public valid: boolean;
}
