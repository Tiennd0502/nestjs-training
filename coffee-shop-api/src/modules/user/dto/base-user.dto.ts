import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../common/enums/user.enum';

export abstract class BaseUserDto {
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
