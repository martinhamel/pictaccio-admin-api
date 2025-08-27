import { IsUUID } from '@loufa/class-validator';

export class DeleteAccountRequest {
    @IsUUID()
    public id: string;
}
