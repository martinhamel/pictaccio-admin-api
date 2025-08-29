import { IsNumberString, IsString, ValidateNested } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubjectInfoItem {
    @IsString()
    public prop: string;

    @IsString()
    public value: string;
}

export class EditSubjectRequest {
    @IsNumberString()
    @Transform(({value}) => value.toString())
    public subjectId: string;

    @ValidateNested({each: true})
    public subjectInfo: SubjectInfoItem[];
}
