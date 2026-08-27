import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import {
  ProductSortBy,
  ProductStatus,
  RoastLevel,
} from '../enums/product.enum';

const toArray = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.split(',') : value;

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsEnum(RoastLevel, { each: true })
  roastLevel?: RoastLevel[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;
}
