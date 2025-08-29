import { IsAlpha, IsAlphanumeric, IsString } from 'class-validator';
import { SubjectMappings } from '../../../../types/subject_mappings';

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
