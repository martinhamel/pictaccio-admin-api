import { ValidateNested } from '@loufa/class-validator';
import { Comment } from '@pictaccio/admin-api/http/shared/controllers/nested/comment';
import { BaseResponse } from '@pictaccio/admin-api/http/shared/controllers/responses/base_response';

export class GetCommentsResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public comments: Comment[];
}
