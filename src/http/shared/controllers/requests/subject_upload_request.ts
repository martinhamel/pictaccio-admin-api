import { IsAlpha, IsNumber, IsNumberString, ValidateNested } from '@loufa/class-validator';
import { Transform } from 'class-transformer';

class SubjectUploadData {
   @IsNumber()
   public photoCount: number;

   @IsAlpha()
   public firstName: string;

   @IsAlpha()
   public lastName: string;

   public group: string;

   public gpi: string;

   public code: string;

   public extra?: { [key: string]: string };
}

export class SubjectUploadRequest {
   @IsNumberString()
   @Transform(({value}) => value.toString())
   public sessionId: string;

   @Transform(raw => typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value)
   @ValidateNested()
   public data: SubjectUploadData;
}
