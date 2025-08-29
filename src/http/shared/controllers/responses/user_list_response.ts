import { User } from '@pictaccio/shared/types/user';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class UserListResponse extends BaseResponse {
    public users?: User[];
}
