import {
    IsArray,
    IsDate,
    IsNumber,
    IsNumberString,
    Matches,
    ValidateNested
} from 'class-validator';
import { SessionOptions } from '../../../../http/shared/controllers/requests/session_options';
import { SubjectInfo } from '../../../../http/shared/controllers/nested/subject_info';
import { SubjectInfoMappings } from '../../../../http/shared/controllers/nested/subject_info_mappings';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';
import { Transform } from 'class-transformer';

export class CreateSessionRequest {
    @Matches(/^[\w -]+$/i)
    public internalName: string;

    @ValidateNested()
    public options: SessionOptions;

    @Transform(raw => new Date(raw.value))
    @IsDate()
    public datePublish: Date;

    @Transform(raw => new Date(raw.value))
    @IsDate()
    public dateExpire: Date;

    @IsNumberString()
    @Transform(({ value }) => value ? value.toString() : null)
    public workflowId: string;

    @IsNullable()
    @IsNumberString()
    @Transform(({ value }) => value ? value.toString() : null)
    public crosssellId: string | null;

    @IsNumber({}, { each: true })
    public deliveryGroups: number[];

    @IsNumber({}, { each: true })
    public productCatalogs: number[];

    @ValidateNested()
    public mappings: SubjectInfoMappings;

    @IsArray()
    public subjects: SubjectInfo[];

}
