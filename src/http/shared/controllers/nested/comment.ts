import { IsBoolean, IsDate, IsDefined, IsNumber, IsNumberString } from 'class-validator';
import { AdminUser } from '../../../../database/entities/admin_user';
import { Transform } from 'class-transformer';

export class Comment {
    @IsNumberString()
    @Transform(({ value }) => value.toString())
    public id: string;

    @IsDefined()
    public user: AdminUser;

    @IsDefined()
    public message: string;

    @IsBoolean()
    public edited: boolean;

    @IsDate()
    public createdOn: Date;

    @IsDate()
    public updatedOn: Date;
}
