import { IsUUID } from 'class-validator';

export class DeleteUserRequest {
    @IsUUID()
    public id: string;
}
