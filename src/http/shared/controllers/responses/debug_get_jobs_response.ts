import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class DebugGetJobsResponse extends BaseResponse {
    public jobs: string[];
}
