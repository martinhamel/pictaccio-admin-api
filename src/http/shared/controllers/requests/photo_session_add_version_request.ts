import { IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PhotoSessionAddVersionRequest {
  @IsNumberString()
  @Transform(({value}) => value.toString())
  public itemId: string;

  @IsString()
  public original: string;
}
