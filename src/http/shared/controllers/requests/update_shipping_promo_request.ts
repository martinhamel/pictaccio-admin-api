import {
    IsArray,
    IsBoolean,
    IsDate,
    IsNumber, IsOptional,
    ValidateNested
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LocalizedString } from '../../../../http/shared/controllers/nested/localized_string';
import { SessionColor } from '../../../../http/shared/controllers/nested/session_color';
import { SubjectInfo } from '../../../../http/shared/controllers/nested/subject_info';
import { SubjectInfoMappings } from '../../../../http/shared/controllers/nested/subject_info_mappings';
import { IsNullable } from '../../../../http/shared/validators/is_nullable';

export class UpdateShippingPromoRequest {
    @IsNumber()
    public threshold: number;

    @IsBoolean()
    public enabled: boolean;
}
