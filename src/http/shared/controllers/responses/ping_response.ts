import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class PingResponse extends BaseResponse {
    public authenticated: boolean;
}
