import { IsBoolean, IsOptional, IsUUID } from '@loufa/class-validator';

export class ArchiveUserRequest {
    @IsUUID()
    public id: string;

    @IsOptional()
    @IsBoolean()
    public archive?: boolean;
}
