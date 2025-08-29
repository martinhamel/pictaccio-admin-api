import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetStoreNotifyEmailsResponse extends BaseResponse {
    public emails: string[];
}
