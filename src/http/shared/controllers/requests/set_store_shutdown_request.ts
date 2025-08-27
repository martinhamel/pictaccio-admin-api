import { IsBoolean } from '@loufa/class-validator';
import { IsNullable } from '@pictaccio/admin-api/http/shared/validators/is_nullable';

export class SetStoreShutdownRequest {
    @IsBoolean()
    public shutdown: boolean;

    @IsNullable()
    public message: string;
}
