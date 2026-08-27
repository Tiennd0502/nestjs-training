import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weight?: number;

  @ApiPropertyOptional({ enum: ProductUnit })
  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ enum: DiscountType, nullable: true })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  discountValue?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
