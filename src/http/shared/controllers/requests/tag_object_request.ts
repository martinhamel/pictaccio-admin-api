import { IsArray, IsNumberString, ValidateNested } from "@loufa/class-validator";
import { Tag } from '@pictaccio/admin-api/http/shared/controllers/nested/tag';
import { Transform } from "class-transformer";

export class TagObjectRequest {
    @IsArray()
    @IsNumberString(null, { each: true })
    @Transform(({ value }) => value.map(v => v.toString()))
    public ids: string[];

    @ValidateNested({ each: true })
    public tags: Tag[];
}
