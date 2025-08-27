import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { UserName } from '@pictaccio/shared/src/types/user_name';

export class ReadUserNameResponse extends BaseResponse {
    public name?: UserName;
}
