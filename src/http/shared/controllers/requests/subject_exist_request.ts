import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubjectExistRequest {
    @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
    @IsString({each: true})
    public codes: string[];
}
