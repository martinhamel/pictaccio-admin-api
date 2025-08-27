import { IsIn, IsOptional, IsString } from '@loufa/class-validator';
import { TagScope, TagScopes } from '@pictaccio/shared/src/types/tags';

export class Tag {
    @IsString()
    @IsOptional()
    public id?: string;

    @IsIn(TagScopes)
    public scope: TagScope;

    @IsString()
    public text: string;
}
