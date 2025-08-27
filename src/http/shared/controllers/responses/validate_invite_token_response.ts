import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';
import { User } from '@pictaccio/shared/src/types/user';

export class ValidateInviteTokenResponse extends BaseResponse {
    public user: User;
}
