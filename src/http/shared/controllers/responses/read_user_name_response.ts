import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { UserName } from '@pictaccio/shared/types/user_name';

export class ReadUserNameResponse extends BaseResponse {
    public name?: UserName;
}
