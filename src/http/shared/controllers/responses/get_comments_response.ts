import { ValidateNested } from 'class-validator';
import { Comment } from '../../../../http/shared/controllers/nested/comment';
import { BaseResponse } from '../../../../http/shared/controllers/responses/base_response';

export class GetCommentsResponse extends BaseResponse {
    @ValidateNested({ each: true })
    public comments: Comment[];
}
