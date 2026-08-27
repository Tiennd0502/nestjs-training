import { ApiProperty } from '@nestjs/swagger';
import { Meta } from '../interfaces/pagination.interface';

export class MetaDto implements Meta {
  @ApiProperty()
  limit!: number;

  @ApiProperty()
  currentPage!: number;

  @ApiProperty()
  pageCount!: number;

  @ApiProperty()
  totalCount!: number;
}
