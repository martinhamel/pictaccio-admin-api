import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { User } from '@pictaccio/shared/types/user';

export class ReadUserSessionInfoResponse extends BaseResponse {
    info?: User;
}
