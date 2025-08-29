import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class ArchiveUserRequest {
    @IsUUID()
    public id: string;

    @IsOptional()
    @IsBoolean()
    public archive?: boolean;
}
