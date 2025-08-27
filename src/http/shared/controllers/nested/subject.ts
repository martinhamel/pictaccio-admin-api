import { IsString, ValidateNested } from '@loufa/class-validator';

export class Subject {
    @IsString()
    public code: string;

    @IsString({each: true})
    public photos: string[];

    @IsString()
    public uniqueId: string;

    @IsString()
    public name: string;

    @IsString()
    public group: string;
}
