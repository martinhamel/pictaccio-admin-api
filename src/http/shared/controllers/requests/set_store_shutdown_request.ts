import { IsBoolean } from 'class-validator';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';

export class SetStoreShutdownRequest {
    @IsBoolean()
    public shutdown: boolean;

    @IsNullable()
    public message: string;
}
