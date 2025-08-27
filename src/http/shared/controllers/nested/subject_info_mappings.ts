import { IsAlpha, IsAlphanumeric, IsString } from '@loufa/class-validator';
import { SubjectMappings } from '@pictaccio/admin-api/types/subject_mappings';

export class SubjectInfoMappings implements SubjectMappings {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsAlphanumeric()
    uid: string;

    @IsAlphanumeric()
    group: string;

    @IsAlphanumeric()
    code: string;
}
