import { IsUUID } from 'class-validator';

export class DeleteAccountRequest {
    @IsUUID()
    public id: string;
}
