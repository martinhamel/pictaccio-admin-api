import { IsUUID } from '@loufa/class-validator';

export class DeleteUserRequest {
    @IsUUID()
    public id: string;
}
