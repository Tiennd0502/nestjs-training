import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { VALIDATION_RULES } from '../constants/validation.constant.js';

const { MIN_PAGE, DEFAULT_PAGE, MIN_LIMIT, MAX_LIMIT, DEFAULT_LIMIT } =
  VALIDATION_RULES.PAGINATION;

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_PAGE)
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_LIMIT)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  search?: string;
}

export class MetaDto {
  @ApiProperty()
  limit!: number;

  @ApiProperty()
  currentPage!: number;

  @ApiProperty()
  pageCount!: number;

  @ApiProperty()
  totalCount!: number;
}

export class PaginatedResult<T> {
  data!: T[];
  meta!: MetaDto;
}
