import { IsNumberString } from '@loufa/class-validator';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class CreateSessionResponse extends BaseResponse {
    @IsNumberString()
    sessionId?: string;
}
