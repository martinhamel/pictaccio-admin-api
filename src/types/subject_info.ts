import { SubjectInfoExtra } from '@pictaccio/admin-api/types/subject_info_extra';

export interface SubjectInfo {
    firstName: string;
    lastName: string;
    subjectCode: string;
    uniqueCode: string;
    group: string;
    extra: SubjectInfoExtra;
}
