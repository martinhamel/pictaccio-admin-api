import { IsNumberString } from 'class-validator';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class CreateSessionResponse extends BaseResponse {
    @IsNumberString()
    sessionId?: string;
}
