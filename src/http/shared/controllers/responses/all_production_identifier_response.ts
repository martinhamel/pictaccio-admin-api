import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class AllProductionIdentifierResponse extends BaseResponse {
    public used: number[];
    public unused: number[];
}
