import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';
import { User } from '@pictaccio/shared/types/user';

export class ValidateInviteTokenResponse extends BaseResponse {
    public user: User;
}
