// Example shape for class-validator DTOs — see .claude/rules/coding.md "Validation".
// Illustrative only: class-validator is not yet installed in this project.
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
