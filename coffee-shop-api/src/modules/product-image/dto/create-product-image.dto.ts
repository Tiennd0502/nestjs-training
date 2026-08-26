import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductImageDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
