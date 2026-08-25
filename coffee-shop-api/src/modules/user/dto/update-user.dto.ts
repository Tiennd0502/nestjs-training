import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../../common/enums/user.enum';
import { BaseUserDto } from './base-user.dto';

export class UpdateUserDto extends BaseUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
