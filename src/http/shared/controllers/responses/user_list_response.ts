import { User } from '@pictaccio/shared/src/types/user';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class UserListResponse extends BaseResponse {
    public users?: User[];
}
