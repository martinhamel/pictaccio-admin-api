import { IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PhotoSelection {
    @IsString()
    public backgroundNumber?: string;

    @IsString()
    public backgroundUrl?: string;

    @IsNumberString()
    @Transform(({value}) => value.toString())
    public subjectId: string;

    @IsString()
    public photoId: string;

    @IsString()
    public photoUrl: string;
}
