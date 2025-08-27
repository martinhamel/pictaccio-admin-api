import { IsNotEmpty, IsNumber, IsString } from '@loufa/class-validator';

export class SubjectSwapPhotosRequest {
    @IsNumber()
    @IsNotEmpty()
    public subjectId1: string;

    @IsNumber()
    @IsNotEmpty()
    public subjectId2: string;

    @IsString()
    @IsNotEmpty()
    public photoPath: string;
}
