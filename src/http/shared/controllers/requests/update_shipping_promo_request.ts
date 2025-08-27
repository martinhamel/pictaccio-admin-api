import {
    IsArray,
    IsBoolean,
    IsDate,
    IsNumber, IsOptional,
    ValidateNested
} from '@loufa/class-validator';
import { Transform } from 'class-transformer';
import { LocalizedString } from '@pictaccio/admin-api/http/shared/controllers/nested/localized_string';
import { SessionColor } from '@pictaccio/admin-api/http/shared/controllers/nested/session_color';
import { SubjectInfo } from '@pictaccio/admin-api/http/shared/controllers/nested/subject_info';
import { SubjectInfoMappings } from '@pictaccio/admin-api/http/shared/controllers/nested/subject_info_mappings';
import { IsNullable } from '@pictaccio/admin-api/http/shared/validators/is_nullable';

export class UpdateShippingPromoRequest {
    @IsNumber()
    public threshold: number;

    @IsBoolean()
    public enabled: boolean;
}
