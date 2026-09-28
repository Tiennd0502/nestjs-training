import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseUserDto } from './base-user.dto.js';

export class CreateUserDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
