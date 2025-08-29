import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class AllProductionIdentifierResponse extends BaseResponse {
    public used: number[];
    public unused: number[];
}
