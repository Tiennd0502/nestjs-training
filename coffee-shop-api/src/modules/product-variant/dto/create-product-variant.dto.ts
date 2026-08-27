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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, ProductUnit } from '../enums/product-variant.enum';

export class CreateProductVariantDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sku!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weight!: number;

  @ApiProperty({ enum: ProductUnit })
  @IsEnum(ProductUnit)
  unit!: ProductUnit;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price!: number;

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
