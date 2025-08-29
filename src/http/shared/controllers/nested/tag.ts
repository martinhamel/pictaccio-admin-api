import { IsIn, IsOptional, IsString } from 'class-validator';
import { TagScope, TagScopes } from '@pictaccio/shared/types/tags';

export class Tag {
    @IsString()
    @IsOptional()
    public id?: string;

    @IsIn(TagScopes)
    public scope: TagScope;

    @IsString()
    public text: string;
}
